const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userDoc = await db.collection('users').doc(decoded.id).get();
    if (!userDoc.exists) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const userData = userDoc.data();
    req.user = { id: userDoc.id, ...userData };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized: token invalid or expired' });
  }
};

module.exports = authMiddleware;
