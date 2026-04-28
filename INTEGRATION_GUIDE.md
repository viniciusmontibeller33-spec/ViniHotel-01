// Guía de integración: Cómo conectar el frontend React con el backend

import apiClient from '@/utils/apiClient';

// ============================================
// 1. USAR EN AUTH CONTEXT
// ============================================

// Actualizar el archivo: src/app/context/auth-context.tsx con:

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';

interface User {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'client' | 'staff' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario al montar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          apiClient.setToken(token);
          const userData = await apiClient.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, contrasena: string) => {
    const response = await apiClient.login(email, contrasena);
    setUser(response.user);
  };

  const register = async (userData: any) => {
    const response = await apiClient.register(userData);
    setUser(response.user);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (userData: any) => {
    await apiClient.updateProfile(userData);
    const updatedUser = await apiClient.getProfile();
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// ============================================
// 2. USAR EN BOOKING CONTEXT
// ============================================

// Actualizar el archivo: src/app/context/booking-context.tsx con:

import { createContext, useContext, ReactNode, useState } from 'react';
import apiClient from '@/utils/apiClient';

interface Booking {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}

interface BookingContextType {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  getMyBookings: () => Promise<void>;
  getBookingById: (id: string) => Promise<Booking>;
  createBooking: (bookingData: any) => Promise<string>;
  updateBooking: (id: string, data: any) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  checkAvailability: (roomId: string, checkIn: string, checkOut: string) => Promise<boolean>;
  setCurrentBooking: (booking: Booking | null) => void;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getMyBookings = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBookingById = async (id: string): Promise<Booking> => {
    const booking = await apiClient.getBooking(id);
    return booking;
  };

  const createBooking = async (bookingData: any): Promise<string> => {
    const response = await apiClient.createBooking(bookingData);
    await getMyBookings();
    return response.id;
  };

  const updateBooking = async (id: string, data: any) => {
    await apiClient.updateBooking(id, data);
    await getMyBookings();
  };

  const cancelBooking = async (id: string) => {
    await apiClient.cancelBooking(id);
    await getMyBookings();
  };

  const checkAvailability = async (roomId: string, checkIn: string, checkOut: string): Promise<boolean> => {
    const response = await apiClient.checkAvailability(roomId, checkIn, checkOut);
    return response.available;
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        currentBooking,
        isLoading,
        getMyBookings,
        getBookingById,
        createBooking,
        updateBooking,
        cancelBooking,
        checkAvailability,
        setCurrentBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}

// ============================================
// 3. USAR EN COMPONENTES REACT
// ============================================

// Ejemplo en componentes:

// -- Login.tsx --
import { useAuth } from '@/app/context/auth-context';
import { useNavigate } from 'react-router';

export function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button disabled={isLoading} type="submit">
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

// -- HotelDetail.tsx --
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import apiClient from '@/utils/apiClient';

export function HotelDetail() {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hotelData = await apiClient.getHotel(hotelId!);
        const roomsData = await apiClient.getRoomsByHotel(hotelId!);
        setHotel(hotelData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching hotel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId]);

  if (loading) return <div>Cargando...</div>;
  if (!hotel) return <div>Hotel no encontrado</div>;

  return (
    <div>
      <h1>{hotel.nombre}</h1>
      <p>{hotel.description}</p>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <h3>{room.name}</h3>
            <p>Precio: ${room.price}</p>
            <p>Capacidad: {room.capacity} personas</p>
            <button>Ver Detalles</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- MyBookings.tsx --
import { useEffect } from 'react';
import { useBooking } from '@/app/context/booking-context';

export function MyBookings() {
  const { bookings, isLoading, getMyBookings } = useBooking();

  useEffect(() => {
    getMyBookings();
  }, []);

  if (isLoading) return <div>Cargando reservas...</div>;

  return (
    <div>
      <h1>Mis Reservas</h1>
      {bookings.length === 0 ? (
        <p>No tienes reservas</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <p>Hotel: {booking.hotelName}</p>
              <p>Check-in: {booking.checkIn}</p>
              <p>Check-out: {booking.checkOut}</p>
              <p>Total: ${booking.totalPrice}</p>
              <p>Estado: {booking.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 4. MANEJO DE ERRORES GLOBAL
// ============================================

// Agregar interceptor en apiClient.ts:

async request(endpoint, options = {}) {
  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token expirado o inválido
      this.clearToken();
      window.location.href = '/login';
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// 5. EJEMPLOS DE USO EN PÁGINAS
// ============================================

// Crear reserva (en booking-confirmation.tsx):
import { useBooking } from '@/app/context/booking-context';
import { useAuth } from '@/app/context/auth-context';

export function BookingConfirmation() {
  const { user } = useAuth();
  const { createBooking } = useBooking();

  const handleConfirmBooking = async () => {
    const bookingData = {
      roomId: selectedRoom.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: numberOfGuests,
      totalPrice: calculateTotal(),
      paymentMethod: 'credit_card',
      paymentStatus: 'pending'
    };

    try {
      const bookingId = await createBooking(bookingData);
      alert('Reserva creada exitosamente: ' + bookingId);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <button onClick={handleConfirmBooking}>Confirmar Reserva</button>
  );
}

// ============================================
// 6. NOTAS IMPORTANTES
// ============================================

/*
✅ El backend debe estar corriendo en http://localhost:5000
✅ El frontend en http://localhost:5173
✅ El token JWT se guarda automáticamente en localStorage
✅ El apiClient se inicializa con el token guardado al cargar la app
✅ Las llamadas autenticadas incluyen el token automáticamente
✅ Los errores 401 redirigen a login automáticamente

❌ No guardes contraseñas en el frontend
❌ No expongas tokens en URLs
❌ Siempre valida en el backend
❌ Usa HTTPS en producción (no HTTP)
*/
