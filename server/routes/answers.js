const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { db } = require('../firebase');

const router = express.Router();

router.post('/:id/answers', authMiddleware, async (req, res) => {
  try {
    const { body } = req.body;
    const questionId = req.params.id;
    if (!body) {
      return res.status(400).json({ message: 'Answer body is required' });
    }
    const questionDoc = await db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const newAnswer = {
      body,
      postedBy: req.user.id,
      questionId,
      upvotes: [],
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    const answerRef = await db.collection('answers').add(newAnswer);
    res.status(201).json({ id: answerRef.id, ...newAnswer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to post answer' });
  }
});

module.exports = router;
