import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

const authenticator = (req, res, next) => {
  // Read from HttpOnly cookie
  const tokenFromCookie = req.cookies?.rm_jwt;

  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.userData = jwt.verify(token, SECRET_KEY);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authenticator;
