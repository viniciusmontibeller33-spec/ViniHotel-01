import { useState, useEffect } from "react";
import { StaffMember } from "../types";
import { loadHotels, loadStaff, saveStaff } from "../data/persistent-data";
import { Users, Mail, Phone, Building, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHotel, setFilterHotel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: "",
    position: "",
    hotelId: "",
    email: "",
    phone: "",
    status: "active",
    hireDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setStaff(loadStaff());
    setHotels(loadHotels());
  }, []);

  useEffect(() => {
    saveStaff(staff);
  }, [staff]);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHotel = filterHotel === "all" || member.hotelId === filterHotel;
    const matchesStatus = filterStatus === "all" || member.status === filterStatus;
    return matchesSearch && matchesHotel && matchesStatus;
  });

  const handleAddOrEditStaff = () => {
    if (!formData.name || !formData.position || !formData.hotelId || !formData.email) {
      return;
    }

    const hotel = hotels.find((h) => h.id === formData.hotelId);
    if (!hotel) return;

    if (editingStaff) {
      setStaff(
        staff.map((member) =>
          member.id === editingStaff.id
            ? { ...member, ...formData, hotelName: hotel.name } as StaffMember
            : member
        )
      );
      setEditingStaff(null);
    } else {
      const newStaff: StaffMember = {
        id: `s${staff.length + 1}`,
        name: formData.name!,
        position: formData.position!,
        hotelId: formData.hotelId!,
        hotelName: hotel.name,
        email: formData.email!,
        phone: formData.phone || "",
        status: formData.status as "active" | "inactive",
        hireDate: formData.hireDate || new Date().toISOString().split("T")[0],
      };
      setStaff([...staff, newStaff]);
    }

    setFormData({
      name: "",
      position: "",
      hotelId: "",
      email: "",
      phone: "",
      status: "active",
      hireDate: new Date().toISOString().split("T")[0],
    });
    setIsAddDialogOpen(false);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData(member);
    setIsAddDialogOpen(true);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      setStaff(staff.filter((member) => member.id !== id));
    }
  };

  const activeStaffCount = staff.filter((s) => s.status === "active").length;
  const inactiveStaffCount = staff.filter((s) => s.status === "inactive").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Personal</h1>
        <p className="text-gray-600">
          Administra el personal de todos los hoteles de la cadena
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Empleados</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
            <Users className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStaffCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Personal Inactivo</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveStaffCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Lista de Personal</CardTitle>
              <CardDescription>Gestiona todos los empleados de la cadena hotelera</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingStaff(null);
                    setFormData({
                      name: "",
                      position: "",
                      hotelId: "",
                      email: "",
                      phone: "",
                      status: "active",
                      hireDate: new Date().toISOString().split("T")[0],
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Personal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingStaff ? "Editar Empleado" : "Agregar Nuevo Empleado"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStaff
                      ? "Actualiza la información del empleado"
                      : "Completa los datos del nuevo empleado"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="María González"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Posición</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Recepcionista"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotel">Hotel</Label>
                    <Select
                      value={formData.hotelId}
                      onValueChange={(value) => setFormData({ ...formData, hotelId: value })}
                    >
                      <SelectTrigger id="hotel">
                        <SelectValue placeholder="Selecciona un hotel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hotels.map((hotel) => (
                          <SelectItem key={hotel.id} value={hotel.id}>
                            {hotel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="maria@hotel.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+34 912 345 678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as "active" | "inactive" })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Fecha de contratación</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddOrEditStaff}
                  disabled={
                    !formData.name || !formData.position || !formData.hotelId || !formData.email
                  }
                >
                  {editingStaff ? "Actualizar Empleado" : "Agregar Empleado"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, posición o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterHotel} onValueChange={setFilterHotel}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los hoteles</SelectItem>
                {hotels.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Contratación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No se encontraron empleados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{member.hotelName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.status === "active" ? "default" : "secondary"}
                          className={
                            member.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {member.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(member.hireDate).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStaff(member)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStaff(member.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
