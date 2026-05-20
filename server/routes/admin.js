const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { db } = require('../firebase');

const router = express.Router();

router.get('/users', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      delete data.password; // Remove password from response
      return { id: doc.id, ...data };
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch users' });
  }
});

router.put('/users/:id/role', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { role, active } = req.body;
    const update = {};
    if (role) update.role = role;
    if (active === false) update.banned = true;
    if (active === true) update.banned = false;
    await db.collection('users').doc(req.params.id).update(update);
    const updatedDoc = await db.collection('users').doc(req.params.id).get();
    if (!updatedDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const data = updatedDoc.data();
    delete data.password;
    res.json({ id: updatedDoc.id, ...data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update user role' });
  }
});

module.exports = router;
