## 📱 Ejemplos de Uso - Frontend React + Backend

### 1️⃣ COMPONENTE LOGIN

```typescript
// src/app/pages/login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/context/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [contrasena, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, contrasena);
      navigate('/'); // Redirigir a home
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <Input
            type="password"
            value={contrasena}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p>
        ¿No tienes cuenta? <a href="/register">Registrate aquí</a>
      </p>

      {/* Credenciales de prueba */}
      <div className="test-credentials">
        <p><strong>Prueba con:</strong></p>
        <p>Email: juan@example.com</p>
        <p>Contraseña: password123</p>
      </div>
    </div>
  );
}
```

---

### 2️⃣ COMPONENTE LISTAR HOTELES

```typescript
// src/app/pages/home.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import apiClient from '@/utils/apiClient';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Hotel {
  idHotel: string;
  nombre: string;
  description: string;
  location: string;
  image: string;
  rating: number;
  amenities: string[];
}

export function Home() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await apiClient.getHotels();
        setHotels(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar hoteles');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) return <div>Cargando hoteles...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (hotels.length === 0) return <div>No hay hoteles disponibles</div>;

  return (
    <div className="home-container">
      <h1>Nuestros Hoteles</h1>
      
      <div className="hotels-grid">
        {hotels.map((hotel) => (
          <Card key={hotel.idHotel} className="hotel-card">
            <img src={hotel.image} alt={hotel.nombre} />
            
            <div className="hotel-info">
              <h2>{hotel.nombre}</h2>
              <p className="description">{hotel.description}</p>
              
              <div className="details">
                <p>📍 {hotel.location}</p>
                <p>⭐ {hotel.rating}/5</p>
              </div>

              <div className="amenities">
                {hotel.amenities.map((amenity, idx) => (
                  <span key={idx} className="badge">{amenity}</span>
                ))}
              </div>

              <Button
                onClick={() => navigate(`/hotel/${hotel.idHotel}`)}
                className="w-full"
              >
                Ver Detalles
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

### 3️⃣ COMPONENTE DETALLE DEL HOTEL Y HABITACIONES

```typescript
// src/app/pages/hotel-detail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '@/utils/apiClient';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

interface Hotel {
  idHotel: string;
  nombre: string;
  description: string;
  location: string;
  rating: number;
  amenities: string[];
}

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  image: string;
  amenities: string[];
  available: number;
}

export function HotelDetail() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!hotelId) return;

      try {
        // Obtener detalles del hotel
        const hotelData = await apiClient.getHotel(hotelId);
        setHotel(hotelData);

        // Obtener habitaciones disponibles
        const roomsData = await apiClient.getRoomsByHotel(hotelId);
        setRooms(roomsData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!hotel) return <div>Hotel no encontrado</div>;

  return (
    <div className="hotel-detail">
      {/* Info Hotel */}
      <section className="hotel-header">
        <h1>{hotel.nombre}</h1>
        <p>{hotel.description}</p>
        <div className="hotel-stats">
          <p>📍 {hotel.location}</p>
          <p>⭐ {hotel.rating}/5</p>
        </div>
        <div className="amenities-list">
          {hotel.amenities.map((amenity, idx) => (
            <span key={idx}>{amenity}</span>
          ))}
        </div>
      </section>

      {/* Habitaciones */}
      <section className="rooms-section">
        <h2>Habitaciones Disponibles</h2>
        
        {rooms.length === 0 ? (
          <p>No hay habitaciones disponibles</p>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <Card key={room.id} className="room-card">
                <img src={room.image} alt={room.name} />
                
                <div className="room-info">
                  <h3>{room.name}</h3>
                  <p className="room-type">{room.type}</p>
                  
                  <div className="specs">
                    <p>👥 Capacidad: {room.capacity} personas</p>
                    <p>✅ Disponibles: {room.available}</p>
                  </div>

                  <div className="amenities-small">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx}>{amenity}</span>
                    ))}
                  </div>

                  <div className="price-section">
                    <span className="price">${room.price}/noche</span>
                  </div>

                  <Button
                    onClick={() => navigate('/booking', {
                      state: { roomId: room.id, hotelName: hotel.nombre }
                    })}
                    disabled={room.available === 0}
                    className="w-full"
                  >
                    Reservar Ahora
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

---

### 4️⃣ COMPONENTE CREAR RESERVA

```typescript
// src/app/pages/payment.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/app/context/auth-context';
import { useBooking } from '@/app/context/booking-context';
import apiClient from '@/utils/apiClient';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Calendar } from '@/app/components/ui/calendar';

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useBooking();

  const roomId = location.state?.roomId;
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomPrice, setRoomPrice] = useState(0);

  // Obtener precio de la habitación
  useEffect(() => {
    const fetchRoomPrice = async () => {
      try {
        const room = await apiClient.getRoom(roomId);
        setRoomPrice(room.price);
      } catch (err) {
        console.error('Error fetching room:', err);
      }
    };

    if (roomId) {
      fetchRoomPrice();
    }
  }, [roomId]);

  // Verificar disponibilidad
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkInDate || !checkOutDate) {
        setIsAvailable(null);
        return;
      }

      try {
        const available = await apiClient.checkAvailability(
          roomId,
          checkInDate,
          checkOutDate
        );
        setIsAvailable(available);
      } catch (err) {
        console.error('Error checking availability:', err);
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, [checkInDate, checkOutDate, roomId]);

  // Calcular noches y total
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const from = new Date(checkInDate);
    const to = new Date(checkOutDate);
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = nights * roomPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Debes estar logged in');
      setLoading(false);
      return;
    }

    if (!isAvailable) {
      setError('La habitación no está disponible en esas fechas');
      setLoading(false);
      return;
    }

    try {
      const bookingId = await createBooking({
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        paymentMethod,
        paymentStatus: 'pending'
      });

      // Crear factura
      await apiClient.createInvoice({
        bookingId,
        subtotal: totalPrice,
        taxes: totalPrice * 0.1,
        total: totalPrice * 1.1,
        additionalCharges: {},
        paymentMethod,
        paymentStatus: 'pending'
      });

      navigate('/booking-confirmation', {
        state: { bookingId, totalPrice: totalPrice * 1.1 }
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h1>Confirmar Reserva</h1>

      <form onSubmit={handleSubmit}>
        {/* Fechas */}
        <div className="form-group">
          <label>Check-in:</label>
          <Input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Check-out:</label>
          <Input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate}
            required
          />
        </div>

        {/* Huéspedes */}
        <div className="form-group">
          <label>Número de huéspedes:</label>
          <Input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
          />
        </div>

        {/* Método de pago */}
        <div className="form-group">
          <label>Método de pago:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="credit_card">Tarjeta de Crédito</option>
            <option value="debit_card">Tarjeta de Débito</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Transferencia Bancaria</option>
          </select>
        </div>

        {/* Disponibilidad */}
        {isAvailable !== null && (
          <div className={`availability-status ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? '✅ Disponible' : '❌ No disponible'}
          </div>
        )}

        {/* Resumen */}
        {nights > 0 && (
          <div className="summary">
            <h3>Resumen de la Reserva</h3>
            <p>Noches: {nights}</p>
            <p>Precio por noche: ${roomPrice}</p>
            <p>Impuestos (10%): ${(totalPrice * 0.1).toFixed(2)}</p>
            <h4>Total: ${(totalPrice * 1.1).toFixed(2)}</h4>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <Button
          type="submit"
          disabled={loading || !isAvailable || nights === 0}
          className="w-full"
        >
          {loading ? 'Procesando...' : 'Confirmar Reserva'}
        </Button>
      </form>
    </div>
  );
}
```

---

### 5️⃣ COMPONENTE VER MIS RESERVAS

```typescript
// src/app/pages/my-bookings.tsx
import { useEffect } from 'react';
import { useBooking } from '@/app/context/booking-context';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

export function MyBookings() {
  const { bookings, isLoading, getMyBookings, cancelBooking } = useBooking();

  useEffect(() => {
    getMyBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (isLoading) return <div>Cargando tus reservas...</div>;

  return (
    <div className="my-bookings">
      <h1>Mis Reservas</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No tienes reservas aún</p>
          <Button onClick={() => window.location.href = '/'}>
            Explorar hoteles
          </Button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <Card key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.hotelName}</h3>
                <span className={`status ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <p>
                  <strong>Habitación:</strong> {booking.roomName} ({booking.type})
                </p>
                <p>
                  <strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}
                </p>
                <p>
                  <strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p>
                  <strong>Huéspedes:</strong> {booking.guests}
                </p>
                <p>
                  <strong>Total:</strong> ${booking.totalPrice.toFixed(2)}
                </p>
                <p>
                  <strong>Estado de pago:</strong> {booking.paymentStatus}
                </p>
              </div>

              <div className="booking-actions">
                <Button variant="outline">Ver Detalles</Button>
                
                {booking.status !== 'cancelled' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('¿Cancelar esta reserva?')) {
                        cancelBooking(booking.id);
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 6️⃣ ACTUALIZAR AUTH CONTEXT

```typescript
// src/app/context/auth-context.tsx
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';

interface User {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'client' | 'staff' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario al montar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          apiClient.setToken(token);
          const userData = await apiClient.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        apiClient.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, contrasena: string) => {
    const response = await apiClient.login(email, contrasena);
    setUser(response.user);
  };

  const register = async (userData: any) => {
    const response = await apiClient.register(userData);
    setUser(response.user);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (userData: any) => {
    await apiClient.updateProfile(userData);
    const updatedUser = await apiClient.getProfile();
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
```

---

## ✨ Notas Importantes

1. **Token JWT**: Se guarda automáticamente en localStorage
2. **Errores 401**: Redirigen automáticamente a login
3. **Disponibilidad**: Se verifica antes de crear reserva
4. **Precios**: Se calculan en tiempo real según noches
5. **Facturas**: Se crean automáticamente al reservar
6. **Roles**: Define permisos (client, staff, admin)

¡Listo para usar! 🚀
