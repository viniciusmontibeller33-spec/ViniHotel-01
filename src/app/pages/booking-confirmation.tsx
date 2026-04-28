import { useLocation, useNavigate } from "react-router";
import { CheckCircle, Calendar, Users, Mail, User, Hotel } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state;

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">No hay información de reserva</h1>
        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Reserva Confirmada!
        </h1>
        <p className="text-gray-600">
          Hemos enviado los detalles de tu reserva a {booking.guestEmail}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-blue-50">
          <CardTitle>Detalles de la Reserva</CardTitle>
          <CardDescription>Número de confirmación: #{Math.random().toString(36).substring(2, 10).toUpperCase()}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Hotel className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">{booking.hotelName}</p>
                <p className="text-gray-600">{booking.roomName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">Fechas de estadía</p>
                <p className="text-gray-600">
                  {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">Huéspedes</p>
                <p className="text-gray-600">{booking.guests} persona(s)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">Nombre del huésped</p>
                <p className="text-gray-600">{booking.guestName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold">Email de contacto</p>
                <p className="text-gray-600">{booking.guestEmail}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Pagado:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${booking.totalPrice}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-2 text-blue-900">Información Importante</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• El check-in es a partir de las 15:00 horas</li>
          <li>• El check-out es hasta las 12:00 horas</li>
          <li>• Por favor, lleva una identificación válida al momento del check-in</li>
          <li>• Puedes cancelar o modificar tu reserva hasta 48 horas antes</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="flex-1" onClick={() => navigate("/")}>
          Volver al Inicio
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate("/my-bookings")}>
          Ver Mis Reservas
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => window.print()}>
          Imprimir
        </Button>
      </div>
    </div>
  );
}