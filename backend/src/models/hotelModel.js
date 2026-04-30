import { getDatabase } from '../utils/database.js';

export async function createHotel(hotelData) {
  const db = await getDatabase();
  const { idHotel, nombre, description, location, image, rating, amenities } = hotelData;

  const result = await db.run(
    `INSERT INTO hoteles (idHotel, nombre, description, location, image, rating)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [idHotel, nombre, description, location, image, rating]
  );

  // Insertar amenities en tabla separada si existen
  if (amenities && Array.isArray(amenities)) {
    const { v4: uuidv4 } = await import('uuid');
    for (const amenity of amenities) {
      await db.run(
        `INSERT INTO hotel_amenities (id, hotelId, amenity) VALUES (?, ?, ?)`,
        [uuidv4(), idHotel, amenity]
      );
    }
  }

  return idHotel;
}

export async function getHotelById(idHotel) {
  const db = await getDatabase();
  const hotel = await db.get(
    'SELECT * FROM hoteles WHERE idHotel = ?',
    [idHotel]
  );
  if (hotel) {
    const amenities = await db.all(
      'SELECT amenity FROM hotel_amenities WHERE hotelId = ?',
      [idHotel]
    );
    hotel.amenities = amenities.map(a => a.amenity);
  }
  return hotel;
}

export async function getAllHotels() {
  const db = await getDatabase();
  const hotels = await db.all('SELECT * FROM hoteles');
  
  for (const hotel of hotels) {
    const amenities = await db.all(
      'SELECT amenity FROM hotel_amenities WHERE hotelId = ?',
      [hotel.idHotel]
    );
    hotel.amenities = amenities.map(a => a.amenity);
  }
  
  return hotels;
}

export async function updateHotel(idHotel, hotelData) {
  const db = await getDatabase();
  const { nombre, description, location, image, rating, amenities } = hotelData;

  const result = await db.run(
    `UPDATE hoteles 
     SET nombre = ?, description = ?, location = ?, image = ?, rating = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE idHotel = ?`,
    [nombre, description, location, image, rating, idHotel]
  );

  // Actualizar amenities
  if (amenities && Array.isArray(amenities)) {
    await db.run('DELETE FROM hotel_amenities WHERE hotelId = ?', [idHotel]);
    const { v4: uuidv4 } = await import('uuid');
    for (const amenity of amenities) {
      await db.run(
        `INSERT INTO hotel_amenities (id, hotelId, amenity) VALUES (?, ?, ?)`,
        [uuidv4(), idHotel, amenity]
      );
    }
  }

  return result.changes > 0;
}

export async function deleteHotel(idHotel) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM hoteles WHERE idHotel = ?', [idHotel]);
  return result.changes > 0;
}
