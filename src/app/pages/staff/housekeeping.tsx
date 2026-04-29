import { useState, useEffect } from "react";
import { Sparkles, Clock, CheckCircle, AlertTriangle, Wrench, Search, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { RoomStatus } from "../../types";
import { loadRooms, saveRooms, loadHotels } from "../../data/persistent-data";

export function Housekeeping() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [hotelList, setHotelList] = useState<any[]>([]);
  const [newRoom, setNewRoom] = useState({
    hotelId: "1",
    name: "",
    type: "Doble",
    price: 100,
    capacity: 2,
    available: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const loadedRooms = loadRooms();
    setRooms(loadedRooms);
    setRoomStatuses(
      loadedRooms.map((room) => ({
        roomId: room.id,
        hotelId: room.hotelId,
        roomName: room.name,
        status: room.status || 'available',
        lastUpdated: new Date().toISOString(),
      }))
    );
    setHotelList(loadHotels());
    setNewRoom(prev => ({ ...prev, hotelId: loadHotels()[0]?.id || "1" }));
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      saveRooms(rooms);
    }
  }, [rooms]);

  const updateRoomStatus = (roomId: string, newStatus: RoomStatus['status']) => {
    // Actualizar roomStatuses
    setRoomStatuses(prev =>
      prev.map(room =>
        room.roomId === roomId
          ? { ...room, status: newStatus, lastUpdated: new Date().toISOString() }
          : room
      )
    );
    
    // Sincronizar con rooms para guardar persistentemente
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, status: newStatus }
          : room
      )
    );
  };

  const addRoom = () => {
    const nextId = `r${Date.now()}`;
    const selectedHotel = hotelList.find((hotel) => hotel.id === newRoom.hotelId);
    if (!selectedHotel) return;

    const createdRoom = {
      id: nextId,
      hotelId: newRoom.hotelId,
      name: newRoom.name || `Habitación ${nextId}`,
      type: newRoom.type,
      price: newRoom.price,
      capacity: newRoom.capacity,
      image: "https://images.unsplash.com/photo-1648766378129-11c3d8d0da05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzczNzYyNDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      amenities: ["Cama King", "WiFi"],
      available: newRoom.available,
      status: 'available',
    };
    setRooms((prev) => [...prev, createdRoom]);
    setRoomStatuses((prev) => [
      ...prev,
      {
        roomId: createdRoom.id,
        hotelId: createdRoom.hotelId,
        roomName: createdRoom.name,
        status: 'available',
        lastUpdated: new Date().toISOString(),
      },
    ]);
    setNewRoom({
      hotelId: hotelList[0]?.id || "1",
      name: "",
      type: "Doble",
      price: 100,
      capacity: 2,
      available: 1,
    });
  };

  const filteredRooms = roomStatuses.filter(room => {
    const matchesSearch = room.roomName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableRooms = roomStatuses.filter(r => r.status === 'available').length;
  const occupiedRooms = roomStatuses.filter(r => r.status === 'occupied').length;
  const cleaningRooms = roomStatuses.filter(r => r.status === 'cleaning').length;
  const maintenanceRooms = roomStatuses.filter(r => r.status === 'maintenance').length;

  const getStatusConfig = (status: RoomStatus['status']) => {
    const configs = {
      available: { 
        label: 'Disponible', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      occupied: { 
        label: 'Ocupado', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        iconColor: 'text-blue-600'
      },
      cleaning: { 
        label: 'Limpieza', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Sparkles,
        iconColor: 'text-yellow-600'
      },
      maintenance: { 
        label: 'Mantenimiento', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Wrench,
        iconColor: 'text-red-600'
      },
    };
    return configs[status];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Limpieza</h1>
        <p className="text-gray-600">
          Control en tiempo real del estado de las habitaciones
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
            <p className="text-xs text-gray-600">
              {((availableRooms / roomStatuses.length) * 100).toFixed(0)}% del total
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ocupadas</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{occupiedRooms}</div>
            <p className="text-xs text-gray-600">
              {((occupiedRooms / roomStatuses.length) * 100).toFixed(0)}% del total
            </p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Limpieza</CardTitle>
            <Sparkles className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{cleaningRooms}</div>
            <p className="text-xs text-gray-600">Requieren atención</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
            <Wrench className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maintenanceRooms}</div>
            <p className="text-xs text-gray-600">Fuera de servicio</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar habitación..."
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
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="occupied">Ocupadas</SelectItem>
                <SelectItem value="cleaning">En limpieza</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agregar habitación nueva */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Añadir habitación</CardTitle>
              <CardDescription>Agrega habitaciones por hotel</CardDescription>
            </div>
            <Button onClick={addRoom} className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" /> Agregar habitación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              value={newRoom.hotelId}
              onValueChange={(value) => setNewRoom((prev) => ({ ...prev, hotelId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona hotel" />
              </SelectTrigger>
              <SelectContent>
                {hotelList.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Nombre habitación"
              value={newRoom.name}
              onChange={(e) => setNewRoom((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Tipo"
              value={newRoom.type}
              onChange={(e) => setNewRoom((prev) => ({ ...prev, type: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Precio"
              value={newRoom.price}
              onChange={(e) => setNewRoom((prev) => ({ ...prev, price: Number(e.target.value) }))}
            />
            <Input
              type="number"
              placeholder="Capacidad"
              value={newRoom.capacity}
              onChange={(e) => setNewRoom((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
            />
            <Input
              type="number"
              placeholder="Disponibles"
              value={newRoom.available}
              onChange={(e) => setNewRoom((prev) => ({ ...prev, available: Number(e.target.value) }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Habitaciones por hotel */}
      <div className="space-y-6">
        {hotelList.map((hotel) => {
          const roomsForHotel = filteredRooms.filter((room) => room.hotelId === hotel.id);
          if (roomsForHotel.length === 0) return null;
          return (
            <div key={hotel.id}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">{hotel.name}</h2>
                <span className="text-sm text-gray-500">{roomsForHotel.length} habitaciones</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomsForHotel.map((room) => {
                  const config = getStatusConfig(room.status);
                  const Icon = config.icon;
                  return (
                    <Card key={room.roomId} className={`border-2 ${config.color.split(' ')[0]}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-base">{room.roomName}</CardTitle>
                            <CardDescription className="text-xs">Actualizado: {formatTime(room.lastUpdated)}</CardDescription>
                          </div>
                          <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Badge className={config.color} variant="outline">{config.label}</Badge>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant={room.status === 'available' ? 'default' : 'outline'} onClick={() => updateRoomStatus(room.roomId, 'available')} className="text-xs">Disponible</Button>
                          <Button size="sm" variant={room.status === 'occupied' ? 'default' : 'outline'} onClick={() => updateRoomStatus(room.roomId, 'occupied')} className="text-xs">Ocupado</Button>
                          <Button size="sm" variant={room.status === 'cleaning' ? 'default' : 'outline'} onClick={() => updateRoomStatus(room.roomId, 'cleaning')} className="text-xs">Limpieza</Button>
                          <Button size="sm" variant={room.status === 'maintenance' ? 'default' : 'outline'} onClick={() => updateRoomStatus(room.roomId, 'maintenance')} className="text-xs">Mantenimiento</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600">No se encontraron habitaciones</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
