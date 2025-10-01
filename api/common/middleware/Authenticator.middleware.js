import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

const authenticator = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.userData = userData;
    next();
  });
};

export default authenticator;
