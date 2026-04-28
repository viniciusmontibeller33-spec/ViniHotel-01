import { useState, useEffect } from "react";
import { Hotel } from "../types";
import { loadHotels, saveHotels } from "../data/persistent-data";
import { Building2, MapPin, Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

export function HotelManagement() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: "",
    description: "",
    location: "",
    image: "",
    rating: 4.5,
    amenities: [],
  });
  const [amenityInput, setAmenityInput] = useState("");

  useEffect(() => {
    const loaded = loadHotels();
    setHotels(loaded);
  }, []);

  useEffect(() => {
    saveHotels(hotels);
  }, [hotels]);

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrEditHotel = () => {
    if (!formData.name || !formData.location || !formData.description) {
      return;
    }

    if (editingHotel) {
      setHotels(
        hotels.map((hotel) =>
          hotel.id === editingHotel.id
            ? { ...hotel, ...formData } as Hotel
            : hotel
        )
      );
      setEditingHotel(null);
    } else {
      const newHotel: Hotel = {
        id: `${hotels.length + 1}`,
        name: formData.name!,
        description: formData.description!,
        location: formData.location!,
        image: formData.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbHxlbnwwfHx8fDE3MDk1NzQ4NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        rating: formData.rating || 4.5,
        amenities: formData.amenities || [],
      };
      setHotels([...hotels, newHotel]);
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData(hotel);
    setIsAddDialogOpen(true);
  };

  const handleDeleteHotel = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este hotel?")) {
      setHotels(hotels.filter((hotel) => hotel.id !== id));
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities?.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      image: "",
      rating: 4.5,
      amenities: [],
    });
    setAmenityInput("");
    setEditingHotel(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Hoteles</h1>
        <p className="text-gray-600">
          Administra todos los hoteles de la cadena ViniHotel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Hoteles</CardTitle>
            <Building2 className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(hotels.reduce((sum, hotel) => sum + hotel.rating, 0) / hotels.length).toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
            <MapPin className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(hotels.map(h => h.location)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Lista de Hoteles</CardTitle>
              <CardDescription>Gestiona todos los hoteles de la cadena</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Hotel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingHotel ? "Editar Hotel" : "Agregar Nuevo Hotel"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingHotel
                      ? "Actualiza la información del hotel"
                      : "Completa los datos del nuevo hotel"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del hotel</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Gran Hotel ViniHotel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Madrid, España"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Un hotel de lujo en el corazón de la ciudad..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">URL de la imagen</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <p className="text-xs text-gray-500">Deja en blanco para usar una imagen por defecto</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Calificación (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amenidades</Label>
                    <div className="flex gap-2">
                      <Input
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        placeholder="WiFi Gratis"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                      />
                      <Button type="button" onClick={addAmenity} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.amenities?.map((amenity, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeAmenity(index)}
                        >
                          {amenity} ×
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Haz clic en una amenidad para eliminarla</p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddOrEditHotel}
                  disabled={
                    !formData.name || !formData.location || !formData.description
                  }
                >
                  {editingHotel ? "Actualizar Hotel" : "Agregar Hotel"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, ubicación o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHotels.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 py-8">
                No se encontraron hoteles
              </div>
            ) : (
              filteredHotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{hotel.name}</CardTitle>
                      <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">{hotel.rating}</span>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {hotel.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {hotel.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotel.amenities.length - 3} más
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditHotel(hotel)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteHotel(hotel.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
