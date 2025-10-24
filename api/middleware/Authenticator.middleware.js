import { hasRole, isAdminUser } from '#common/auth.helper.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

const authenticator = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.userData = jwt.verify(token, SECRET_KEY);

    if (!isAdminUser(req.userData) && (!req.userData.hotelId || !hasRole(req.userData, 'staff'))) {
      return res.status(401).json({ error: "User not associated with hotel, or isn't admin" });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authenticator;
