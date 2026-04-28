import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { loadHotels, loadRooms } from "../data/persistent-data";
import { Star, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Checkbox } from "../components/ui/checkbox";

interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  rating: number;
  amenities: string[];
}

interface Room {
  id: string;
  hotelId: string;
  type: string;
  price: number;
}

export function Home() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [roomType, setRoomType] = useState<string>("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("rating");

  useEffect(() => {
    setHotels(loadHotels());
    setRooms(loadRooms());
  }, []);

  const allAmenities = useMemo(() => {
    const amenities = new Set<string>();
    hotels.forEach((hotel) =>
      hotel.amenities.forEach((a) => amenities.add(a))
    );
    return Array.from(amenities);
  }, [hotels]);

  const roomTypes = useMemo(() => {
    const types = new Set<string>();
    rooms.forEach((room) => types.add(room.type));
    return Array.from(types);
  }, [rooms]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(q) ||
          hotel.location.toLowerCase().includes(q) ||
          hotel.description.toLowerCase().includes(q)
      );
    }

    if (selectedAmenities.length > 0) {
      result = result.filter((hotel) =>
        selectedAmenities.every((a) => hotel.amenities.includes(a))
      );
    }

    if (roomType !== "all") {
      result = result.filter((hotel) =>
        rooms.some((room) => room.hotelId === hotel.id && room.type === roomType)
      );
    }

    if (priceRange !== "all") {
      result = result.filter((hotel) => {
        const hotelRooms = rooms.filter((room) => room.hotelId === hotel.id);
        if (!hotelRooms.length) return false;
        const min = Math.min(...hotelRooms.map((room) => room.price));
        if (priceRange === "low") return min < 150;
        if (priceRange === "medium") return min >= 150 && min <= 300;
        return min > 300;
      });
    }

    return result.sort((a, b) => {
      if (sortBy === "price-low") {
        const aMin = Math.min(
          ...rooms.filter((r) => r.hotelId === a.id).map((r) => r.price)
        );
        const bMin = Math.min(
          ...rooms.filter((r) => r.hotelId === b.id).map((r) => r.price)
        );
        return aMin - bMin;
      }
      if (sortBy === "price-high") {
        const aMin = Math.min(
          ...rooms.filter((r) => r.hotelId === a.id).map((r) => r.price)
        );
        const bMin = Math.min(
          ...rooms.filter((r) => r.hotelId === b.id).map((r) => r.price)
        );
        return bMin - aMin;
      }
      return b.rating - a.rating;
    });
  }, [hotels, rooms, searchTerm, selectedAmenities, roomType, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange("all");
    setRoomType("all");
    setSelectedAmenities([]);
    setSortBy("rating");
  };

  const hasActiveFilters =
    !!searchTerm ||
    priceRange !== "all" ||
    roomType !== "all" ||
    selectedAmenities.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Encuentra tu Hotel Perfecto</h1>
        <p className="text-gray-600">Reserva tu próxima estadía.</p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid lg:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-8"
                placeholder="Buscar hotel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="price-low">Precio ascendente</SelectItem>
                <SelectItem value="price-high">Precio descendente</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filtros
                  {hasActiveFilters && (
                    <Badge>
                      {selectedAmenities.length +
                        (priceRange !== "all" ? 1 : 0) +
                        (roomType !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>Refina tu búsqueda</SheetDescription>
                </SheetHeader>
                <div className="space-y-3 mt-3">
                  <div>
                    <Label>Rango de Precio</Label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Precio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="low">Menos de $150</SelectItem>
                        <SelectItem value="medium">$150 - $300</SelectItem>
                        <SelectItem value="high">Más de $300</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de habitación</Label>
                    <Select value={roomType} onValueChange={setRoomType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {roomTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Servicios</Label>
                    <div className="space-y-1 max-h-32 overflow-auto mt-1">
                      {allAmenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={() => toggleAmenity(amenity)}
                          />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4" /> Limpiar filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      <div className="mb-2 text-gray-600">
        {filteredHotels.length}{" "}
        {filteredHotels.length === 1 ? "hotel encontrado" : "hoteles encontrados"}
      </div>

      {filteredHotels.length === 0 ? (
        <Card className="text-center py-6">
          <CardContent>
            No se encontraron hoteles.
            <Button variant="link" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHotels.map((hotel) => {
            const hotelRooms = rooms.filter((room) => room.hotelId === hotel.id);
            const minPrice = hotelRooms.length
              ? Math.min(...hotelRooms.map((r) => r.price))
              : 0;

            return (
              <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  onClick={() => navigate(`/hotel/${hotel.id}`)}
                  className="cursor-pointer overflow-hidden h-40"
                >
                  <img
                    src={hotel.image}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    alt={hotel.name}
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{hotel.name}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4" />
                      {hotel.rating}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {hotel.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {hotel.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hotel.amenities.slice(0, 3).map((a) => (
                      <Badge
                        key={a}
                        className="cursor-pointer hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          if (!selectedAmenities.includes(a)) {
                            setSelectedAmenities([...selectedAmenities, a]);
                          }
                        }}
                      >
                        {a}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2 font-semibold">{hotelRooms.length > 0 ? `Desde $${minPrice}` : "Sin precio"}</div>
                </CardContent>
                <CardFooter>
                  <button
                    onClick={() => navigate(`/hotel/${hotel.id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
                  >
                    Ver detalles
                  </button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
