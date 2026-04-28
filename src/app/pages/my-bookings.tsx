import { useNavigate } from "react-router";
import { useBooking } from "../context/booking-context";
import { Calendar, Hotel, Users, Mail, User, Trash2, CalendarRange, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function MyBookings() {
  const navigate = useNavigate();
  const { getUserBookings, cancelBooking } = useBooking();
  const bookings = getUserBookings();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });
  };

  const isUpcoming = (checkIn: string) => {
    return new Date(checkIn) > new Date();
  };

  const isPast = (checkOut: string) => {
    return new Date(checkOut) < new Date();
  };

  const handleCancelBooking = (id: string) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      cancelBooking(id);
    }
  };

  const upcomingBookings = bookings.filter((b) => isUpcoming(b.checkIn));
  const pastBookings = bookings.filter((b) => isPast(b.checkOut));
  const currentBookings = bookings.filter((b) => !isUpcoming(b.checkIn) && !isPast(b.checkOut));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Reservaciones</h1>
        <p className="text-gray-600">
          Gestiona todas tus reservas de hoteles
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <CalendarRange className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tienes reservaciones</h3>
            <p className="text-gray-600 mb-6">
              Comienza a explorar nuestros hoteles y haz tu primera reserva
            </p>
            <Button onClick={() => navigate("/")}>
              Explorar Hoteles
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                <CalendarRange className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Próximas</CardTitle>
                <Calendar className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingBookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <Hotel className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pastBookings.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Reservas Actuales */}
          {currentBookings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Estancia Actual</h2>
              <div className="grid grid-cols-1 gap-6">
                {currentBookings.map((booking) => (
                  <Card key={booking.id} className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Hotel className="w-5 h-5" />
                            {booking.hotelName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {booking.roomName}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-600">En curso</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Fechas</p>
                            <p className="text-sm text-gray-600">
                              {formatDateShort(booking.checkIn)} - {formatDateShort(booking.checkOut)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Huéspedes</p>
                            <p className="text-sm text-gray-600">{booking.guests} persona(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Nombre</p>
                            <p className="text-sm text-gray-600">{booking.guestName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Email</p>
                            <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">Total pagado:</span>
                          <span className="text-2xl font-bold text-green-600 ml-2">
                            ${booking.totalPrice}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Próximas Reservas */}
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Próximas Reservas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Hotel className="w-5 h-5" />
                            {booking.hotelName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {booking.roomName}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                          Próxima
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Check-in</p>
                            <p className="text-sm text-gray-600">{formatDate(booking.checkIn)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Check-out</p>
                            <p className="text-sm text-gray-600">{formatDate(booking.checkOut)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Huéspedes</p>
                            <p className="text-sm text-gray-600">{booking.guests} persona(s)</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t flex justify-between items-center mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="text-xl font-bold text-blue-600 ml-2">
                            ${booking.totalPrice}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancelar Reserva
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reservas Pasadas */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Historial de Reservas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastBookings.map((booking) => (
                  <Card key={booking.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Hotel className="w-5 h-5" />
                            {booking.hotelName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {booking.roomName}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Completada</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Estadía</p>
                            <p className="text-sm text-gray-600">
                              {formatDateShort(booking.checkIn)} - {formatDateShort(booking.checkOut)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold">Huéspedes</p>
                            <p className="text-sm text-gray-600">{booking.guests} persona(s)</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div>
                          <span className="text-sm text-gray-600">Total pagado:</span>
                          <span className="text-lg font-bold ml-2">
                            ${booking.totalPrice}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
