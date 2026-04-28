import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Booking, Invoice } from "../types";
import { useAuth } from "./auth-context";

interface BookingContextType {
  bookings: Booking[];
  invoices: Invoice[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status" | "paymentStatus">) => Booking;
  getUserBookings: () => Booking[];
  getAllBookings: () => Booking[];
  cancelBooking: (id: string) => void;
  updateBooking: (id: string, updates: Partial<Omit<Booking, 'id' | 'guestEmail' | 'guestName' | 'hotelName' | 'hotelId' | 'roomName' | 'roomId' | 'createdAt'>>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  updatePaymentStatus: (id: string, paymentStatus: Booking['paymentStatus']) => void;
  checkIn: (id: string) => void;
  checkOut: (id: string) => void;
  createInvoice: (booking: Booking, additionalCharges?: any[]) => Invoice;
  getUserInvoices: () => Invoice[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  bookings: "vinihotel_bookings",
  invoices: "vinihotel_invoices",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore localStorage errors
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage(STORAGE_KEYS.bookings, []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage(STORAGE_KEYS.invoices, []));
  const { user } = useAuth();

  const addBooking = (booking: Omit<Booking, "id" | "createdAt" | "status" | "paymentStatus">) => {
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [...prev, newBooking]);

    // Crear factura automáticamente
    createInvoice(newBooking);

    return newBooking;
  };

  const getUserBookings = () => {
    if (!user) return [];
    return bookings.filter((booking) => booking.guestEmail === user.email);
  };

  const getAllBookings = () => {
    return bookings;
  };

  const updateBooking = (id: string, updates: Partial<Omit<Booking, 'id' | 'guestEmail' | 'guestName' | 'hotelName' | 'hotelId' | 'roomName' | 'roomId' | 'createdAt'>>) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, ...updates } : booking
      )
    );
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? { ...booking, status: 'cancelled' as const, paymentStatus: 'refunded' as const }
          : booking
      )
    );
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
  };

  const updatePaymentStatus = (id: string, paymentStatus: Booking['paymentStatus']) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, paymentStatus } : booking
      )
    );
  };

  const checkIn = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? { ...booking, status: 'checked-in' as const, roomStatus: 'occupied' as const }
          : booking
      )
    );
  };

  const checkOut = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? { ...booking, status: 'completed' as const, roomStatus: 'cleaning' as const }
          : booking
      )
    );
  };

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.bookings, bookings);
  }, [bookings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.invoices, invoices);
  }, [invoices]);

  const createInvoice = (booking: Booking, additionalCharges: any[] = []) => {
    const subtotal = booking.totalPrice;
    const taxes = subtotal * 0.16; // 16% tax
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const total = subtotal + taxes + chargesTotal;

    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      bookingId: booking.id,
      userId: booking.guestEmail,
      hotelName: booking.hotelName,
      roomName: booking.roomName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      subtotal,
      taxes,
      additionalCharges,
      total,
      paymentMethod: 'Tarjeta de crédito',
      paymentStatus: booking.paymentStatus,
      issuedDate: new Date().toISOString(),
    };

    setInvoices((prev) => [...prev, newInvoice]);
    return newInvoice;
  };

  const getUserInvoices = () => {
    if (!user) return [];
    return invoices.filter((invoice) => invoice.userId === user.email);
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        invoices,
        addBooking,
        getUserBookings,
        getAllBookings,
        cancelBooking,
        updateBooking,
        updateBookingStatus,
        updatePaymentStatus,
        checkIn,
        checkOut,
        createInvoice,
        getUserInvoices,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}