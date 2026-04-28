// Cliente HTTP para consumir la API del backend
const API_URL = 'http://localhost:5000/api';

interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  message?: string;
  error?: string;
  token?: string;
  data?: T;
  [key: string]: unknown;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestConfig = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error: ApiResponse<unknown> = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    // Convertir password a contrasena para el backend
    const registerData = {
      ...userData,
      ...(userData.password && !userData.contrasena ? { contrasena: userData.password } : {})
    };
    
    const response = await this.request<ApiResponse<unknown>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<unknown>> {
    const response = await this.request<ApiResponse<unknown>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, contrasena: password })
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getProfile(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/auth/me');
  }

  async updateProfile(userData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Hotels endpoints
  async getHotels(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/hotels');
  }

  async getHotel(idHotel: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/hotels/${idHotel}`);
  }

  async createHotel(hotelData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData)
    });
  }

  async updateHotel(idHotel: string, hotelData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/hotels/${idHotel}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData)
    });
  }

  async deleteHotel(idHotel: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/hotels/${idHotel}`, {
      method: 'DELETE'
    });
  }

  // Rooms endpoints
  async getRooms(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/rooms');
  }

  async getRoomsByHotel(hotelId: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/rooms/hotel/${hotelId}`);
  }

  async getRoom(id: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/rooms/${id}`);
  }

  async createRoom(roomData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  async updateRoom(id: string, roomData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  }

  async deleteRoom(id: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/rooms/${id}`, {
      method: 'DELETE'
    });
  }

  async checkAvailability(roomId: string, checkIn: string, checkOut: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/rooms/check-availability', {
      method: 'POST',
      body: JSON.stringify({ roomId, checkIn, checkOut })
    });
  }

  // Bookings endpoints
  async getMyBookings(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/bookings/my-bookings');
  }

  async getBooking(id: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/bookings/${id}`);
  }

  async createBooking(bookingData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async updateBooking(id: string, bookingData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    });
  }

  async cancelBooking(id: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/bookings/${id}/cancel`, {
      method: 'POST'
    });
  }

  async getAllBookings(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/bookings');
  }

  // Invoices endpoints
  async getMyInvoices(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/invoices/my-invoices');
  }

  async getInvoice(id: string): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/invoices/${id}`);
  }

  async createInvoice(invoiceData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async updateInvoice(id: string, invoiceData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData)
    });
  }

  async getAllInvoices(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/invoices');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
