import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { loadHotels, loadRooms } from "../data/persistent-data";
import { useAuth } from "../context/auth-context";
import { Star, MapPin, Wifi, Users, Bed, Calendar, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

export function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [expandedRoomImage, setExpandedRoomImage] = useState<{image: string; name: string} | null>(null);

  useEffect(() => {
    setHotels(loadHotels());
    setRooms(loadRooms());
  }, []);

  const hotel = hotels.find((h) => h.id === id);
  const hotelRooms = rooms.filter((r) => r.hotelId === id);
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    guestName: user?.name || "",
    guestEmail: user?.email || "",
  });

  if (hotels.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Cargando hotel...</h1>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Hotel no encontrado</h1>
        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>
    );
  }

  const handleBooking = () => {
    const room = hotelRooms.find((r) => r.id === selectedRoom);
    if (!room) return;

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    navigate("/payment", {
      state: {
        hotelName: hotel.name,
        hotelId: hotel.id,
        roomName: room.name,
        roomId: room.id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Hoteles
      </Button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="aspect-[21/9] overflow-hidden">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{hotel.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Star className="w-6 h-6 fill-blue-600 text-blue-600" />
              <span className="text-xl font-semibold text-blue-600">{hotel.rating}</span>
            </div>
          </div>
          <p className="text-gray-700 mb-6">{hotel.description}</p>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((amenity: string) => (
              <Badge key={amenity} variant="secondary">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Habitaciones Disponibles</h2>
      {hotelRooms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md">
          No hay habitaciones cargadas para este hotel. Intenta recargar la página o comprueba el origen de datos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotelRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
            <div 
              className="aspect-video overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedRoomImage({image: room.image, name: room.name})}
            >
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {room.type}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {room.capacity} personas
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.map((amenity: string) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${room.price}</span>
                  <span className="text-gray-600 text-sm"> / noche</span>
                </div>
                <span className="text-sm text-gray-600">
                  {room.available} disponibles
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedRoom(room.id)}
                    disabled={room.available === 0}
                  >
                    {room.available > 0 ? "Reservar Ahora" : "No Disponible"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Reservar {room.name}</DialogTitle>
                    <DialogDescription>
                      Completa los datos para confirmar tu reserva
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="checkIn">Fecha de entrada</Label>
                        <Input
                          id="checkIn"
                          type="date"
                          value={bookingData.checkIn}
                          onChange={(e) =>
                            setBookingData({ ...bookingData, checkIn: e.target.value })
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="border-blue-500 ring-blue-500 focus:border-blue-600 focus:ring-blue-600 bg-blue-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkOut">Fecha de salida</Label>
                        <Input
                          id="checkOut"
                          type="date"
                          value={bookingData.checkOut}
                          onChange={(e) =>
                            setBookingData({ ...bookingData, checkOut: e.target.value })
                          }
                          min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
                          className="border-blue-500 ring-blue-500 focus:border-blue-600 focus:ring-blue-600 bg-blue-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guests">Número de huéspedes</Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={room.capacity}
                        value={bookingData.guests}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, guests: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Nombre completo</Label>
                      <Input
                        id="guestName"
                        placeholder="Juan Pérez"
                        value={bookingData.guestName}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, guestName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail">Email</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={bookingData.guestEmail}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, guestEmail: e.target.value })
                        }
                      />
                    </div>
                    {bookingData.checkIn && bookingData.checkOut && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Total:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            $
                            {room.price *
                              Math.ceil(
                                (new Date(bookingData.checkOut).getTime() -
                                  new Date(bookingData.checkIn).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.ceil(
                            (new Date(bookingData.checkOut).getTime() -
                              new Date(bookingData.checkIn).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          noche(s) × ${room.price}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleBooking}
                    disabled={
                      !bookingData.checkIn ||
                      !bookingData.checkOut ||
                      !bookingData.guestName ||
                      !bookingData.guestEmail
                    }
                  >
                    Confirmar Reserva
                  </Button>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}

      {/* Image Viewer Dialog */}
      {expandedRoomImage && (
        <Dialog open={!!expandedRoomImage} onOpenChange={(open) => !open && setExpandedRoomImage(null)}>
          <DialogContent className="sm:max-w-[800px] p-0">
            <div className="relative w-full">
              <img
                src={expandedRoomImage.image}
                alt={expandedRoomImage.name}
                className="w-full h-auto"
              />
              <p className="p-4 text-center text-gray-700 font-semibold">{expandedRoomImage.name}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}