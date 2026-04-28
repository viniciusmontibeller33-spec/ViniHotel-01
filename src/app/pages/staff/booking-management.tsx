import { useState } from "react";
import { useBooking } from "../../context/booking-context";
import { Calendar, Search, Filter, UserCheck, UserX, Clock, CheckCircle, XCircle, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Booking } from "../../types";

export function BookingManagement() {
  const { getAllBookings, updateBooking, updateBookingStatus, checkIn, checkOut, addBooking } = useBooking();
  const allBookings = getAllBookings();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editBookingData, setEditBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    status: "confirmed",
  });

  // Formulario para crear reserva manual
  const [manualBooking, setManualBooking] = useState({
    hotelName: "",
    hotelId: "",
    roomName: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    totalPrice: 0,
    guestName: "",
    guestEmail: "",
  });

  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const confirmedBookings = filteredBookings.filter((b) => b.status === "confirmed");
  const checkedInBookings = filteredBookings.filter((b) => b.status === "checked-in");
  const completedBookings = filteredBookings.filter((b) => b.status === "completed");
  const cancelledBookings = filteredBookings.filter((b) => b.status === "cancelled");
  const pendingBookings = filteredBookings.filter((b) => b.status === "pending");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const variants: Record<Booking["status"], { label: string; variant: any }> = {
      confirmed: { label: "Confirmada", variant: "default" },
      pending: { label: "Pendiente", variant: "outline" },
      cancelled: { label: "Cancelada", variant: "destructive" },
      completed: { label: "Completada", variant: "secondary" },
      "checked-in": { label: "En curso", variant: "default" },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  const handleCheckIn = (booking: Booking) => {
    checkIn(booking.id);
  };

  const handleCheckOut = (booking: Booking) => {
    checkOut(booking.id);
  };

  const handleCreateManualBooking = () => {
    addBooking(manualBooking);
    setIsDialogOpen(false);
    setManualBooking({
      hotelName: "",
      hotelId: "",
      roomName: "",
      roomId: "",
      checkIn: "",
      checkOut: "",
      guests: 1,
      totalPrice: 0,
      guestName: "",
      guestEmail: "",
    });
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{booking.guestName}</h3>
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-sm text-gray-600">{booking.guestEmail}</p>
              <p className="text-sm text-gray-600 mt-1">ID: {booking.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${booking.totalPrice}</p>
              <p className="text-xs text-gray-600">
                {booking.paymentStatus === "paid" ? "✓ Pagado" : "Pendiente"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <p><strong>Hotel:</strong> {booking.hotelName}</p>
            <p><strong>Habitación:</strong> {booking.roomName}</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
            </div>
            <p><strong>Huéspedes:</strong> {booking.guests}</p>
          </div>

          <div className="flex gap-2">
            {booking.status === "confirmed" && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleCheckIn(booking)}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Check-in
              </Button>
            )}
            {booking.status === "checked-in" && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleCheckOut(booking)}
              >
                <UserX className="w-4 h-4 mr-2" />
                Check-out
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedBooking(booking);
                setEditBookingData({
                  checkIn: booking.checkIn,
                  checkOut: booking.checkOut,
                  guests: booking.guests,
                  status: booking.status,
                });
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">
          Administra todas las reservas del hotel
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{confirmedBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En curso</CardTitle>
            <UserCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{checkedInBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelledBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email, hotel o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="checked-in">En curso</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Reserva Manual</DialogTitle>
                  <DialogDescription>
                    Completa los datos para crear una nueva reserva
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del huésped</Label>
                    <Input
                      value={manualBooking.guestName}
                      onChange={(e) => setManualBooking({ ...manualBooking, guestName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={manualBooking.guestEmail}
                      onChange={(e) => setManualBooking({ ...manualBooking, guestEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hotel</Label>
                    <Input
                      value={manualBooking.hotelName}
                      onChange={(e) => setManualBooking({ ...manualBooking, hotelName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Habitación</Label>
                    <Input
                      value={manualBooking.roomName}
                      onChange={(e) => setManualBooking({ ...manualBooking, roomName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-in</Label>
                    <Input
                      type="date"
                      value={manualBooking.checkIn}
                      onChange={(e) => setManualBooking({ ...manualBooking, checkIn: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out</Label>
                    <Input
                      type="date"
                      value={manualBooking.checkOut}
                      onChange={(e) => setManualBooking({ ...manualBooking, checkOut: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Huéspedes</Label>
                    <Input
                      type="number"
                      min="1"
                      value={manualBooking.guests}
                      onChange={(e) => setManualBooking({ ...manualBooking, guests: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio Total</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={manualBooking.totalPrice}
                      onChange={(e) => setManualBooking({ ...manualBooking, totalPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateManualBooking}>
                  Crear Reserva
                </Button>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Reserva</DialogTitle>
                  <DialogDescription>
                    Actualiza fechas, huéspedes o estado de la reserva.
                  </DialogDescription>
                </DialogHeader>
                {selectedBooking ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in</Label>
                        <Input
                          type="date"
                          value={editBookingData.checkIn}
                          onChange={(e) => setEditBookingData((prev) => ({ ...prev, checkIn: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Check-out</Label>
                        <Input
                          type="date"
                          value={editBookingData.checkOut}
                          onChange={(e) => setEditBookingData((prev) => ({ ...prev, checkOut: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Huéspedes</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editBookingData.guests}
                        onChange={(e) => setEditBookingData((prev) => ({ ...prev, guests: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={editBookingData.status}
                        onValueChange={(value) => setEditBookingData((prev) => ({ ...prev, status: value as Booking['status'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirmada</SelectItem>
                          <SelectItem value="checked-in">En curso</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (selectedBooking) {
                          updateBooking(selectedBooking.id, {
                            checkIn: editBookingData.checkIn,
                            checkOut: editBookingData.checkOut,
                            guests: editBookingData.guests,
                            status: editBookingData.status as Booking['status'],
                          });
                        }
                        setIsEditDialogOpen(false);
                      }}
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                ) : (
                  <p>No hay reserva seleccionada</p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reservas por tabs */}
      <Tabs defaultValue="confirmed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="confirmed">
            Confirmadas ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="checked-in">
            En curso ({checkedInBookings.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedBookings.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-8">
                No hay reservas confirmadas
              </p>
            ) : (
              confirmedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="checked-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkedInBookings.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-8">
                No hay reservas en curso
              </p>
            ) : (
              checkedInBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBookings.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-8">
                No hay reservas pendientes
              </p>
            ) : (
              pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedBookings.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-8">
                No hay reservas completadas
              </p>
            ) : (
              completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cancelledBookings.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-8">
                No hay reservas canceladas
              </p>
            ) : (
              cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
