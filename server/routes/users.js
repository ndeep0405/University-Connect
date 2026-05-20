const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { db } = require('../firebase');

const router = express.Router();

router.get('/faculty', authMiddleware, async (req, res) => {
  try {
    const facultySnapshot = await db.collection('users').where('role', '==', 'faculty').get();
    const faculty = [];
    for (const doc of facultySnapshot.docs) {
      const user = { id: doc.id, ...doc.data() };
      const verifiedAnswers = await db.collection('answers').where('postedBy', '==', doc.id).where('isVerified', '==', true).get();
      user.verifiedCount = verifiedAnswers.size;
      faculty.push(user);
    }
    res.json(faculty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load faculty' });
  }
});

router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const questionSnapshot = await db.collection('questions').where('postedBy', '==', req.user.id).get();
    const answerSnapshot = await db.collection('answers')
      .where('postedBy', '==', req.user.id)
      .where('isVerified', '==', true)
      .get();

    res.json({
      questions: questionSnapshot.size,
      answers: answerSnapshot.size,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load user activity' });
  }
});

module.exports = router;
