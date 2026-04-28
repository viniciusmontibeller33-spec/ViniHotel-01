import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { useBooking } from "../context/booking-context";
import { User, Mail, Phone, MapPin, Calendar, CreditCard, FileText, Download, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

export function UserProfile() {
  const { user, updateProfile } = useAuth();
  const { getUserBookings, getUserInvoices } = useBooking();
  const bookings = getUserBookings();
  const invoices = getUserInvoices();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth || "",
    nationality: user?.nationality || "",
    documentId: user?.documentId || "",
  });

  const handleSave = () => {
    if (updateProfile) {
      updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        documentId: formData.documentId,
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const InvoiceDialog = ({ invoice }: { invoice: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Ver Factura
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Factura #{invoice.id.slice(-8).toUpperCase()}</DialogTitle>
          <DialogDescription>
            Emitida el {formatDate(invoice.issuedDate)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Información del hotel */}
          <div>
            <h3 className="font-semibold mb-2">Detalles del Servicio</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Hotel:</strong> {invoice.hotelName}</p>
              <p><strong>Habitación:</strong> {invoice.roomName}</p>
              <p><strong>Check-in:</strong> {formatDate(invoice.checkIn)}</p>
              <p><strong>Check-out:</strong> {formatDate(invoice.checkOut)}</p>
            </div>
          </div>

          {/* Desglose de costos */}
          <div>
            <h3 className="font-semibold mb-2">Desglose de Costos</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos (16%)</span>
                <span>{formatCurrency(invoice.taxes)}</span>
              </div>
              {invoice.additionalCharges && invoice.additionalCharges.length > 0 && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <p className="font-semibold mb-2">Cargos Adicionales</p>
                    {invoice.additionalCharges.map((charge: any) => (
                      <div key={charge.id} className="flex justify-between text-sm">
                        <span>{charge.description}</span>
                        <span>{formatCurrency(charge.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Información de pago */}
          <div>
            <h3 className="font-semibold mb-2">Información de Pago</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Método:</strong> {invoice.paymentMethod}</p>
              <p>
                <strong>Estado:</strong>{" "}
                <Badge variant={invoice.paymentStatus === "paid" ? "default" : "secondary"}>
                  {invoice.paymentStatus === "paid" ? "Pagado" : invoice.paymentStatus === "pending" ? "Pendiente" : "Reembolsado"}
                </Badge>
              </p>
            </div>
          </div>

          <Button className="w-full" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y revisa tu historial</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Datos Personales</TabsTrigger>
          <TabsTrigger value="bookings">
            Historial de Reservas
            {bookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{bookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Facturas
            {invoices.length > 0 && (
              <Badge variant="secondary" className="ml-2">{invoices.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Datos Personales */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Mantén tu información actualizada para una mejor experiencia
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                >
                  {isEditing ? "Guardar Cambios" : "Editar Perfil"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidad</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    disabled={!isEditing}
                    placeholder="México"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentId">Documento de Identidad</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="documentId"
                      value={formData.documentId}
                      onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="ABC123456"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="Calle, Número, Ciudad, País"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial de Reservas */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reservas</CardTitle>
              <CardDescription>
                Todas tus reservas pasadas y futuras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No tienes reservas aún
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{booking.hotelName}</h3>
                              <Badge variant={
                                booking.status === "confirmed" ? "default" :
                                booking.status === "cancelled" ? "destructive" :
                                booking.status === "completed" ? "secondary" :
                                booking.status === "checked-in" ? "default" : "outline"
                              }>
                                {booking.status === "confirmed" ? "Confirmada" :
                                 booking.status === "cancelled" ? "Cancelada" :
                                 booking.status === "completed" ? "Completada" :
                                 booking.status === "checked-in" ? "En curso" : booking.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{booking.roomName}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                              </span>
                              <span>{booking.guests} huésped(es)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {formatCurrency(booking.totalPrice)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.paymentStatus === "paid" ? "Pagado" : 
                               booking.paymentStatus === "pending" ? "Pendiente" : "Reembolsado"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facturas */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Mis Facturas</CardTitle>
              <CardDescription>
                Descarga y revisa todas tus facturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No tienes facturas aún
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <h3 className="font-semibold">
                                Factura #{invoice.id.slice(-8).toUpperCase()}
                              </h3>
                              <Badge variant={invoice.paymentStatus === "paid" ? "default" : "secondary"}>
                                {invoice.paymentStatus === "paid" ? "Pagado" : 
                                 invoice.paymentStatus === "pending" ? "Pendiente" : "Reembolsado"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{invoice.hotelName} - {invoice.roomName}</p>
                            <p className="text-sm text-gray-600">
                              Emitida el {formatDate(invoice.issuedDate)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-2xl font-bold text-blue-600">
                              {formatCurrency(invoice.total)}
                            </p>
                            <InvoiceDialog invoice={invoice} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
