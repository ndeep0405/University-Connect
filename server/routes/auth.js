const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

const router = express.Router();

const COLLEGE_DOMAIN = process.env.COLLEGE_DOMAIN || '@vbithyd.ac.in';

const createToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '7d'
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !department || !role)
      return res.status(400).json({ message: 'All fields are required' });

    if (!email.endsWith('@vbithyd.ac.in'))
      return res.status(400).json({ message: 'Only @vbithyd.ac.in emails are allowed' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Check if email already exists
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty)
      return res.status(400).json({ message: 'Email already registered. Please login instead.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      department,
      role,
      reputation: 0,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(newUser);

    const token = jwt.sign(
      { id: docRef.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: docRef.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department, reputation: newUser.reputation }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Database error: ${error.message}` });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, reputation: user.reputation } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
