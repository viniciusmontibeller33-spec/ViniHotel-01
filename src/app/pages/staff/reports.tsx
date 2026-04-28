import { useMemo } from "react";
import { useBooking } from "../../context/booking-context";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function Reports() {
  const { getAllBookings, invoices } = useBooking();
  const bookings = getAllBookings();

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const occupancyRate = totalBookings > 0 ? ((confirmedBookings + completedBookings) / totalBookings) * 100 : 0;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    // Agrupar por mes
    const monthlyData = bookings.reduce((acc, booking) => {
      const month = new Date(booking.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { count: 0, revenue: 0 };
      }
      acc[month].count++;
      acc[month].revenue += booking.totalPrice;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Agrupar por hotel
    const hotelData = bookings.reduce((acc, booking) => {
      if (!acc[booking.hotelName]) {
        acc[booking.hotelName] = { count: 0, revenue: 0 };
      }
      acc[booking.hotelName].count++;
      acc[booking.hotelName].revenue += booking.totalPrice;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return {
      totalRevenue,
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      occupancyRate,
      averageBookingValue,
      monthlyData,
      hotelData,
    };
  }, [bookings, invoices]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reportes y Estadísticas</h1>
          <p className="text-gray-600">
            Análisis detallado del rendimiento del hotel
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Todos los tiempos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.confirmedBookings} confirmadas activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.occupancyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.completedBookings} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <Users className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.averageBookingValue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Por reserva
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Estado de Reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Reservas</CardTitle>
            <CardDescription>Distribución actual de reservas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span>Confirmadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">{stats.confirmedBookings}</Badge>
                <span className="text-sm text-gray-600">
                  {((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Completadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{stats.completedBookings}</Badge>
                <span className="text-sm text-gray-600">
                  {((stats.completedBookings / stats.totalBookings) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Canceladas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{stats.cancelledBookings}</Badge>
                <span className="text-sm text-gray-600">
                  {((stats.cancelledBookings / stats.totalBookings) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Hoteles */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Hotel</CardTitle>
            <CardDescription>Hoteles con más reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.hotelData)
                .sort(([, a], [, b]) => b.count - a.count)
                .slice(0, 5)
                .map(([hotel, data]) => (
                  <div key={hotel} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{hotel}</span>
                      <span className="text-sm text-gray-600">{data.count} reservas</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(data.count / stats.totalBookings) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-green-600 whitespace-nowrap">
                        {formatCurrency(data.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ingresos Mensuales */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos Mensuales</CardTitle>
          <CardDescription>Evolución de ingresos y reservas por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.monthlyData).map(([month, data]) => (
              <div key={month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{month}</span>
                  <div className="flex gap-4">
                    <Badge variant="outline">{data.count} reservas</Badge>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(data.revenue / stats.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasa de Cancelación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {((stats.cancelledBookings / stats.totalBookings) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats.cancelledBookings} de {stats.totalBookings} reservas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasa de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(((stats.confirmedBookings + stats.completedBookings) / stats.totalBookings) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Reservas exitosas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">RevPAR (Revenue Per Available Room)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(stats.averageBookingValue * (stats.occupancyRate / 100))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Indicador de rendimiento
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
