export const getDaysSinceEpoch = (timeStamp) => {
  const date = new Date(+timeStamp);
  return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
};

export const getHotelId = (req) => {
  const userData = req.userData;
  const { hotelId } = userData;
  return hotelId;
};

export const getUserName = (req) => {
  const userData = req.userData;
  const { username } = userData;
  return username;
};

export const isAuthenticatedUser = (req) => {
  const jwt = require('jsonwebtoken');
  const SECRET_KEY = process.env.SECRET_KEY;

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return false;
  }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) {
      return false;
    }
    req.userData = userData;
  });
  return true;
};
