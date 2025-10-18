import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

const adminAuthenticator = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.userData = jwt.verify(token, SECRET_KEY);
    if (
      !req.userData?.groups?.includes('admin') &&
      !req.userData?.groups?.includes('super_admin')
    ) {
      return res.status(401).json({ error: 'not authorized admin access' });
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default adminAuthenticator;
