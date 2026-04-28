import { Hotel, Room, StaffMember } from "../types";
import { hotels as defaultHotels, rooms as defaultRooms, staffMembers as defaultStaff } from "./mock-data";

const STORAGE_KEYS = {
  hotels: "vinihotel_hotels",
  rooms: "vinihotel_rooms",
  staff: "vinihotel_staff",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore localStorage errors
  }
}

export function loadHotels(): Hotel[] {
  return loadFromStorage(STORAGE_KEYS.hotels, defaultHotels);
}

export function saveHotels(hotels: Hotel[]) {
  saveToStorage(STORAGE_KEYS.hotels, hotels);
}

export function loadRooms(): Room[] {
  const storedRooms = loadFromStorage(STORAGE_KEYS.rooms, defaultRooms);

  const rooms: Room[] = Array.isArray(storedRooms) ? [...storedRooms] : [...defaultRooms];

  // Si no hay nada almacenado, restaurar defaults
  if (rooms.length === 0) {
    saveRooms(defaultRooms);
    return defaultRooms;
  }

  // Asegurar que no falten habitaciones esenciales desde la data por defecto
  const existingRoomIds = new Set(rooms.map((room) => room.id));
  let changed = false;

  for (const defaultRoom of defaultRooms) {
    if (!existingRoomIds.has(defaultRoom.id)) {
      rooms.push(defaultRoom);
      changed = true;
    }
  }

  // Asegurar que cada hotel tiene al menos 1 habitación (evita precios en 0 en home)
  const hotelRoomMap = new Map<string, number>();
  for (const room of rooms) {
    hotelRoomMap.set(room.hotelId, (hotelRoomMap.get(room.hotelId) ?? 0) + 1);
  }

  for (const hotel of defaultHotels) {
    if (!hotelRoomMap.has(hotel.id)) {
      const fallbackRoom = defaultRooms.find((r) => r.hotelId === hotel.id);
      if (fallbackRoom) {
        rooms.push(fallbackRoom);
        changed = true;
      }
    }
  }

  if (changed) {
    saveRooms(rooms);
  }

  return rooms;
}

export function saveRooms(rooms: Room[]) {
  saveToStorage(STORAGE_KEYS.rooms, rooms);
}

export function loadStaff(): StaffMember[] {
  return loadFromStorage(STORAGE_KEYS.staff, defaultStaff);
}

export function saveStaff(staff: StaffMember[]) {
  saveToStorage(STORAGE_KEYS.staff, staff);
}
