import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send('Token not provided');
  }

  let userEmail;
  try {
    userEmail = await jwt.verify(token, 'velrins-secret').email;
  } catch (err) {
    return res.status(400).send('Invalid token');
  }

  req.body.userEmail = userEmail;
  next();
};

export default auth;
