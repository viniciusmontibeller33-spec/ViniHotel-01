import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Hotel, Users, LogOut, User, Building2, CalendarRange, ClipboardList, Sparkles, BarChart3, Menu } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Hotel className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">ViniHotel</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActivePath("/")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Hotel className="w-4 h-4" />
                Hoteles
              </Link>

              {/* Menú para Clientes */}
              {isAuthenticated && user?.role === "customer" && (
                <>
                  <Link
                    to="/my-bookings"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActivePath("/my-bookings")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <CalendarRange className="w-4 h-4" />
                    Mis Reservas
                  </Link>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActivePath("/profile")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                </>
              )}

              {/* Menú para Staff */}
              {isAuthenticated && user?.role === "staff" && (
                <>
                  <Link
                    to="/bookings"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActivePath("/bookings")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Reservas
                  </Link>
                  <Link
                    to="/housekeeping"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActivePath("/housekeeping")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Limpieza
                  </Link>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActivePath("/profile")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                </>
              )}

              {/* Menú para Admin */}
              {isAuthenticated && user?.role === "admin" && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Administración
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/hotels" className="flex items-center cursor-pointer">
                          <Building2 className="w-4 h-4 mr-2" />
                          Hoteles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/staff" className="flex items-center cursor-pointer">
                          <Users className="w-4 h-4 mr-2" />
                          Personal
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Operaciones
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Operaciones del Hotel</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/bookings" className="flex items-center cursor-pointer">
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Reservas
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/housekeeping" className="flex items-center cursor-pointer">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Limpieza
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/reports" className="flex items-center cursor-pointer">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Reportes
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </nav>

            {/* Usuario dropdown */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user?.name}</span>
                      <Menu className="w-4 h-4 lg:hidden" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {/* Información del usuario */}
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <User className="w-4 h-4 mr-2" />
                      <div className="flex flex-col">
                        <span className="font-medium">{user?.name}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                      </div>
                    </DropdownMenuItem>

                    {/* Rol del usuario */}
                    <DropdownMenuItem disabled>
                      <span className="text-xs font-semibold text-gray-500 uppercase ml-6">
                        {user?.role === "customer" && "Cliente"}
                        {user?.role === "staff" && "Personal"}
                        {user?.role === "admin" && "Administrador"}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Mi Perfil - Para todos */}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>

                    {/* --- FUNCIONALIDADES DE CLIENTE --- */}
                    {user?.role === "customer" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">Cliente</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to="/my-bookings" className="cursor-pointer">
                            <CalendarRange className="w-4 h-4 mr-2" />
                            Mis Reservas
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* --- FUNCIONALIDADES DE STAFF --- */}
                    {user?.role === "staff" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">Operaciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to="/bookings" className="cursor-pointer">
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Gestionar Reservas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/housekeeping" className="cursor-pointer">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Limpieza
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* --- FUNCIONALIDADES DE ADMIN --- */}
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">Gestión</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to="/hotels" className="cursor-pointer">
                            <Building2 className="w-4 h-4 mr-2" />
                            Hoteles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/staff" className="cursor-pointer">
                            <Users className="w-4 h-4 mr-2" />
                            Personal
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">Operaciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to="/bookings" className="cursor-pointer">
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Reservas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/housekeeping" className="cursor-pointer">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Limpieza
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/reports" className="cursor-pointer">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Reportes
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Logout */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Iniciar Sesión
                  </Button>
                  <Button onClick={() => navigate("/register")}>
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Hotel className="w-6 h-6" />
                <span className="font-semibold">ViniHotel</span>
              </div>
              <p className="text-gray-400 text-sm">
                Reserva habitaciones en los mejores hoteles del mundo con confianza y seguridad.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Clientes</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white">Buscar Hoteles</Link></li>
                {isAuthenticated && user?.role === "customer" && (
                  <>
                    <li><Link to="/my-bookings" className="hover:text-white">Mis Reservas</Link></li>
                    <li><Link to="/profile" className="hover:text-white">Mi Perfil</Link></li>
                  </>
                )}
                {!isAuthenticated && (
                  <li><Link to="/register" className="hover:text-white">Crear Cuenta</Link></li>
                )}
              </ul>
            </div>

            {isAuthenticated && user?.role === "staff" && (
              <div>
                <h3 className="font-semibold mb-4">Panel de Staff</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/bookings" className="hover:text-white">Reservas</Link></li>
                  <li><Link to="/housekeeping" className="hover:text-white">Limpieza</Link></li>
                  <li><Link to="/profile" className="hover:text-white">Mi Perfil</Link></li>
                </ul>
              </div>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <div>
                <h3 className="font-semibold mb-4">Panel de Admin</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/hotels" className="hover:text-white">Hoteles</Link></li>
                  <li><Link to="/staff" className="hover:text-white">Personal</Link></li>
                  <li><Link to="/bookings" className="hover:text-white">Reservas</Link></li>
                  <li><Link to="/housekeeping" className="hover:text-white">Limpieza</Link></li>
                  <li><Link to="/reports" className="hover:text-white">Reportes</Link></li>
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@vinihotel.com</li>
                <li>Teléfono: +1 234 567 890</li>
                <li>Soporte 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 ViniHotel. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
