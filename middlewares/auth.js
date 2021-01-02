const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  const token = req.headers['x-auth-token'];

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

module.exports = auth;
