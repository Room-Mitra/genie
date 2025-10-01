import bcrypt from 'bcrypt';
import { addHotel, getHotel } from './AndroidLogin.repository.js';

const ID_TYPE = 'ANDROID_LOGIN:';
const getId = ({ hotelId }) => `${ID_TYPE}${hotelId}`;

const getHotelDetails = async ({ hotelId }) => {
  hotelId = hotelId.toLocaleLowerCase();
  const id = getId({ hotelId });
  const hotelData = await getHotel(id);
  console.info(`${hotelId} -> ` + 'Hotel Data :: ', hotelData);
  if (hotelData) {
    return hotelData;
  }
  return null;
};

export const verifyHotelCredentials = async ({ hotelId, password }) => {
  if (!hotelId || !password) {
    return false;
  }
  const hotel = await getHotelDetails({ hotelId });
  if (!hotel) {
    return false;
  }
  return await bcrypt.compare(password, hotel.password);
};

//RoomMitra, Admin
export const addHotelLogin = async (hotelId, password) => {
  hotelId = hotelId.toLocaleLowerCase();
  const hotelData = { hotelId, password };
  const isHotelExists = await getHotelDetails({ hotelId });
  if (isHotelExists) {
    throw new Error('Hotel already exists');
  }

  const id = getId({ hotelId });
  const hashedPassword = await bcrypt.hash(password, 10);
  hotelData.password = hashedPassword;
  const isUserAdded = await addHotel({ id, ...hotelData });
  if (!isUserAdded) {
    throw new Error('Failed to add user');
  }
  return isUserAdded;
};