import { getDatabase } from '../utils/database.js';

export async function createHotel(hotelData) {
  const db = await getDatabase();
  const { idHotel, nombre, description, location, image, rating, amenities } = hotelData;

  const result = await db.run(
    `INSERT INTO hoteles (idHotel, nombre, description, location, image, rating, amenities)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [idHotel, nombre, description, location, image, rating, JSON.stringify(amenities)]
  );

  return idHotel;
}

export async function getHotelById(idHotel) {
  const db = await getDatabase();
  const hotel = await db.get(
    'SELECT * FROM hoteles WHERE idHotel = ?',
    [idHotel]
  );
  if (hotel) {
    hotel.amenities = JSON.parse(hotel.amenities);
  }
  return hotel;
}

export async function getAllHotels() {
  const db = await getDatabase();
  const hotels = await db.all('SELECT * FROM hoteles');
  return hotels.map(h => ({
    ...h,
    amenities: JSON.parse(h.amenities)
  }));
}

export async function updateHotel(idHotel, hotelData) {
  const db = await getDatabase();
  const { nombre, description, location, image, rating, amenities } = hotelData;

  const result = await db.run(
    `UPDATE hoteles 
     SET nombre = ?, description = ?, location = ?, image = ?, rating = ?, amenities = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE idHotel = ?`,
    [nombre, description, location, image, rating, JSON.stringify(amenities), idHotel]
  );

  return result.changes > 0;
}

export async function deleteHotel(idHotel) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM hoteles WHERE idHotel = ?', [idHotel]);
  return result.changes > 0;
}
