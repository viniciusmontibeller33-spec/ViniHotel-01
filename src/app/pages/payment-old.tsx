import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CreditCard, Building2, Calendar, Lock, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useBooking } from "../context/booking-context";
import { useAuth } from "../context/auth-context";

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const { addBooking } = useBooking();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("debit-card");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
  });
  const [agreedTerms, setAgreedTerms] = useState(false);

  if (!bookingData) {
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

  const handlePayment = () => {
    // Guardar la reserva en el contexto
    addBooking({
      hotelName: bookingData.hotelName,
      hotelId: bookingData.hotelId,
      roomName: bookingData.roomName,
      roomId: bookingData.roomId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalPrice: bookingData.totalPrice,
      guestName: bookingData.guestName,
      guestEmail: user?.email || bookingData.guestEmail,
    });

    // Navegar a la confirmación con el flag saved para evitar duplicados
    navigate("/booking-confirmation", {
      state: { ...bookingData, saved: true },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <h1 className="text-3xl font-bold mb-8">Confirmar y Pagar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen de la reserva */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{bookingData.hotelName}</h3>
                <p className="text-gray-600">{bookingData.roomName}</p>
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{formatDate(bookingData.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{formatDate(bookingData.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Huéspedes:</span>
                  <span className="font-medium">{bookingData.guests}</span>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${bookingData.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos (16%)</span>
                  <span>${(bookingData.totalPrice * 0.16).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">
                    ${(bookingData.totalPrice * 1.16).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-sm">
                <p className="text-green-800 font-medium">✓ Cancelación gratuita</p>
                <p className="text-green-700 text-xs mt-1">
                  Cancela hasta 48 horas antes sin costo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de pago */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
              <CardDescription>
                Selecciona tu método de pago preferido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod("debit-card")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === "debit-card"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Débito</p>
                </button>
                <button
                  onClick={() => setPaymentMethod("bank-transfer")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === "bank-transfer"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Building2 className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Transferencia</p>
                </button>
                <button
                  onClick={() => setPaymentMethod("qr")}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === "qr"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Badge className="mx-auto mb-2 px-2 py-1 text-xs">QR</Badge>
                  <p className="text-sm font-medium">QR</p>
                </button>
              </div>

              {paymentMethod === "debit-card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          setPaymentData({ ...paymentData, cardNumber: e.target.value })
                        }
                        maxLength={19}
                        className="pr-10"
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nombre del Titular</Label>
                    <Input
                      id="cardName"
                      placeholder="JUAN PÉREZ"
                      value={paymentData.cardName}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cardName: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                      <div className="relative">
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={paymentData.expiryDate}
                          onChange={(e) =>
                            setPaymentData({ ...paymentData, expiryDate: e.target.value })
                          }
                          maxLength={5}
                          className="pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <div className="relative">
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) =>
                            setPaymentData({ ...paymentData, cvv: e.target.value })
                          }
                          maxLength={4}
                          className="pr-10"
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress">Dirección de Facturación</Label>
                    <Input
                      id="billingAddress"
                      placeholder="Calle, Número, Ciudad, País"
                      value={paymentData.billingAddress}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, billingAddress: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank-transfer" && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">Información para Transferencia</p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Banco:</strong> Banco ViniHotel</p>
                    <p><strong>Cuenta:</strong> 1234567890</p>
                    <p><strong>CLABE:</strong> 123456789012345678</p>
                    <p><strong>Referencia:</strong> {bookingData.guestEmail}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    * La reserva se confirmará una vez que se reciba el pago
                  </p>
                </div>
              )}
              {paymentMethod === "qr" && (
                <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-cyan-100 border border-purple-200 p-4 rounded-lg">
                  <p className="font-semibold">Pago por QR</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Escanea el siguiente código QR con tu app bancaria y completa el pago de <strong>${(bookingData.totalPrice * 1.16).toFixed(2)}</strong>.
                  </p>
                  <div className="mt-3 p-3 bg-white rounded-lg border border-dashed border-purple-300">
                    <div className="w-40 h-40 bg-purple-100 rounded-lg mx-auto flex items-center justify-center text-purple-500">
                      QR
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Paga y vuelve para completar tu reserva.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen antes de pagar</CardTitle>
              <CardDescription>Revisa y acepta los términos antes de confirmar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Hotel</span>
                <span className="font-medium">{bookingData.hotelName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Habitación</span>
                <span className="font-medium">{bookingData.roomName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fechas</span>
                <span className="font-medium">{formatDate(bookingData.checkIn)} - {formatDate(bookingData.checkOut)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-semibold text-blue-600">${(bookingData.totalPrice * 1.16).toFixed(2)}</span>
              </div>
              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  Acepto los términos y condiciones y la política de privacidad.
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos del Huésped</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{bookingData.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{bookingData.guestEmail}</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Tu información de pago está protegida con encriptación de nivel bancario.
                No almacenamos los datos de tu tarjeta.
              </p>
            </div>

            <Button
              className="w-full py-6 text-lg"
              onClick={handlePayment}
              disabled={
                !agreedTerms ||
                ((paymentMethod === "credit-card" || paymentMethod === "debit-card") &&
                  (!paymentData.cardNumber ||
                    !paymentData.cardName ||
                    !paymentData.expiryDate ||
                    !paymentData.cvv))
              }
            >
              {paymentMethod === "qr" ? "Confirmar y completar con QR" : "Confirmar y Pagar"} ${(bookingData.totalPrice * 1.16).toFixed(2)}
            </Button>

            <p className="text-xs text-gray-600 text-center">
              Al hacer clic en "Confirmar y Pagar", aceptas nuestros{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Términos y Condiciones
              </a>{" "}
              y nuestra{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
