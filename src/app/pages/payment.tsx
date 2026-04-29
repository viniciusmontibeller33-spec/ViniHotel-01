import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CreditCard, Building2, Calendar, Lock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
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
import { Alert, AlertDescription } from "../components/ui/alert";
import { useBooking } from "../context/booking-context";
import { useAuth } from "../context/auth-context";
import { apiClient } from "../../utils/apiClient";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handlePayment = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Validar información requerida
      if (!agreedTerms) {
        throw new Error("Debes aceptar los términos y condiciones");
      }

      // Validar datos de tarjeta si es pago con tarjeta
      if (paymentMethod === "debit-card") {
        const cleanCardNumber = paymentData.cardNumber.replace(/\s/g, '');
        if (!cleanCardNumber || cleanCardNumber.length < 13) {
          throw new Error("Por favor, ingresa un número de tarjeta válido (mínimo 13 dígitos)");
        }
        if (!paymentData.cardName || paymentData.cardName.trim().length === 0) {
          throw new Error("Por favor, ingresa el nombre del titular de la tarjeta");
        }
        const cleanExpiry = paymentData.expiryDate.replace(/\s/g, '');
        if (!cleanExpiry || cleanExpiry.length < 5 || !cleanExpiry.includes('/')) {
          throw new Error("Por favor, ingresa una fecha de vencimiento válida (MM/AA)");
        }
        if (!paymentData.cvv || paymentData.cvv.length < 3) {
          throw new Error("Por favor, ingresa un CVV válido (3-4 dígitos)");
        }
        if (!paymentData.billingAddress || paymentData.billingAddress.trim().length === 0) {
          throw new Error("Por favor, ingresa una dirección de facturación");
        }
      }

      // Validar datos de reserva
      if (!bookingData?.roomId || !bookingData?.checkIn || !bookingData?.checkOut || !bookingData?.guests) {
        throw new Error("Información de reserva incompleta");
      }

      // Crear la reserva
      const bookingPayload = {
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice: bookingData.totalPrice,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "debit-card" ? "paid" : "pending",
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail
      };

      let bookingId = null;
      let usedBackend = false;

      // Intentar crear la reserva en el backend
      try {
        const response = await apiClient.createBooking(bookingPayload);
        
        if (response && (response.id || response.message)) {
          bookingId = response.id || `booking-${Date.now()}`;
          usedBackend = true;
          console.log('✅ Reserva creada en backend:', bookingId);
        } else if (response?.error) {
          throw new Error(response.error);
        }
      } catch (backendError) {
        console.warn('⚠️ Backend no disponible, usando localStorage:', backendError);
        // Fallback a localStorage
        usedBackend = false;
      }

      // Si el backend no funcionó, guardar en localStorage
      if (!usedBackend) {
        bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log('💾 Guardando reserva en localStorage:', bookingId);
      }

      // Guardar localmente también
      const localBooking = {
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
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "debit-card" ? "paid" : "pending"
      };

      addBooking(localBooking);

      // Navegar a la confirmación
      navigate("/booking-confirmation", {
        state: { 
          ...bookingData, 
          saved: true, 
          bookingId,
          paymentMethod,
          paymentStatus: paymentMethod === "debit-card" ? "paid" : "pending"
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(errorMessage);
      console.error('❌ Payment error:', err);
    } finally {
      setIsLoading(false);
    }
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

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

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
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
                          const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                          setPaymentData({ ...paymentData, cardNumber: formatted })
                        }}
                        maxLength={19}
                        className="pr-10"
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    {paymentData.cardNumber && paymentData.cardNumber.replace(/\s/g, '').length < 13 && (
                      <p className="text-xs text-red-600">Debe tener al menos 13 dígitos</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nombre del Titular</Label>
                    <Input
                      id="cardName"
                      placeholder="JUAN PÉREZ"
                      value={paymentData.cardName}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() })
                      }
                    />
                    {paymentData.cardName && paymentData.cardName.trim().length === 0 && (
                      <p className="text-xs text-red-600">Requerido</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                      <div className="relative">
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={paymentData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2);
                            }
                            setPaymentData({ ...paymentData, expiryDate: value })
                          }}
                          maxLength={5}
                          className="pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      {paymentData.expiryDate && paymentData.expiryDate.replace(/\D/g, '').length < 4 && (
                        <p className="text-xs text-red-600">Formato: MM/AA</p>
                      )}
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
                            setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                          }
                          maxLength={4}
                          className="pr-10"
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      {paymentData.cvv && paymentData.cvv.length < 3 && (
                        <p className="text-xs text-red-600">Debe tener 3-4 dígitos</p>
                      )}
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
                    {paymentData.billingAddress && paymentData.billingAddress.trim().length === 0 && (
                      <p className="text-xs text-red-600">Requerido</p>
                    )}
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
                <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-cyan-100 border border-purple-200 p-6 rounded-lg">
                  <p className="font-semibold text-lg">Pago por QR</p>
                  <p className="text-sm text-gray-700 mt-2">
                    Escanea el siguiente código QR con tu app bancaria y completa el pago de <strong>${(bookingData.totalPrice * 1.16).toFixed(2)}</strong>.
                  </p>
                  <div className="mt-4 p-4 bg-white rounded-lg border border-dashed border-purple-300 flex justify-center">
                    <div className="text-center">
                      <img 
                        src="/qr-payment.png" 
                        alt="Código QR de pago"
                        className="w-48 h-48 mx-auto object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    💡 Abre tu app bancaria, selecciona la opción de pagar por QR y escanea esta imagen. Después vuelve para completar tu reserva.
                  </p>
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

            {paymentMethod === "debit-card" && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-900 mb-2">Campos requeridos:</p>
                <ul className="space-y-1 text-blue-800">
                  <li className={`flex items-center gap-2 ${paymentData.cardNumber && paymentData.cardNumber.replace(/\s/g, '').length >= 13 ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentData.cardNumber && paymentData.cardNumber.replace(/\s/g, '').length >= 13 ? '✓' : '○'} Número de tarjeta (13+ dígitos)
                  </li>
                  <li className={`flex items-center gap-2 ${paymentData.cardName && paymentData.cardName.trim().length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentData.cardName && paymentData.cardName.trim().length > 0 ? '✓' : '○'} Nombre del titular
                  </li>
                  <li className={`flex items-center gap-2 ${paymentData.expiryDate && paymentData.expiryDate.replace(/\D/g, '').length === 4 ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentData.expiryDate && paymentData.expiryDate.replace(/\D/g, '').length === 4 ? '✓' : '○'} Fecha de vencimiento (MM/AA)
                  </li>
                  <li className={`flex items-center gap-2 ${paymentData.cvv && paymentData.cvv.length >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentData.cvv && paymentData.cvv.length >= 3 ? '✓' : '○'} CVV (3-4 dígitos)
                  </li>
                  <li className={`flex items-center gap-2 ${paymentData.billingAddress && paymentData.billingAddress.trim().length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentData.billingAddress && paymentData.billingAddress.trim().length > 0 ? '✓' : '○'} Dirección de facturación
                  </li>
                  <li className={`flex items-center gap-2 ${agreedTerms ? 'text-green-600' : 'text-red-600'}`}>
                    {agreedTerms ? '✓' : '○'} Aceptar términos y condiciones
                  </li>
                </ul>
              </div>
            )}

            <Button
              className="w-full py-6 text-lg"
              onClick={handlePayment}
              disabled={
                isLoading || 
                !agreedTerms ||
                (paymentMethod === "debit-card" && (
                  !paymentData.cardNumber.replace(/\s/g, '') ||
                  paymentData.cardNumber.replace(/\s/g, '').length < 13 ||
                  !paymentData.cardName.trim() ||
                  paymentData.expiryDate.replace(/\D/g, '').length !== 4 ||
                  !paymentData.cvv ||
                  paymentData.cvv.length < 3 ||
                  !paymentData.billingAddress.trim()
                ))
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {paymentMethod === "qr" ? "Confirmar y completar con QR" : "Confirmar y Pagar"} ${(bookingData.totalPrice * 1.16).toFixed(2)}
                </>
              )}
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
