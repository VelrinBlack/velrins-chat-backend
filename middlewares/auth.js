import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  const token = req.body.token || req.query.token;

  if (!token) {
    return res.status(400).json({ info: 'Token not provided' });
  }

  try {
    req.body.user = await jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ info: 'Invalid token' });
  }

  next();
};

export default auth;
