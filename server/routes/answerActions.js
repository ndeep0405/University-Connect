const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { db } = require('../firebase');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { postedBy, isVerified } = req.query;
    let query = db.collection('answers');

    if (postedBy) {
      query = query.where('postedBy', '==', postedBy);
    }
    if (isVerified !== undefined) {
      query = query.where('isVerified', '==', isVerified === 'true');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const answers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(answers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load answers' });
  }
});

router.put('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const answerDoc = await db.collection('answers').doc(req.params.id).get();
    if (!answerDoc.exists) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    const answer = { id: answerDoc.id, ...answerDoc.data() };
    const alreadyUpvoted = answer.upvotes.includes(req.user.id);
    if (alreadyUpvoted) {
      answer.upvotes = answer.upvotes.filter(id => id !== req.user.id);
    } else {
      answer.upvotes.push(req.user.id);
    }
    await db.collection('answers').doc(req.params.id).update({ upvotes: answer.upvotes });
    if (!alreadyUpvoted) {
      const userDoc = await db.collection('users').doc(answer.postedBy).get();
      if (userDoc.exists) {
        const user = userDoc.data();
        await db.collection('users').doc(answer.postedBy).update({ reputation: user.reputation + 10 });
      }
    }
    res.json({ id: answerDoc.id, ...answerDoc.data(), upvotes: answer.upvotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to upvote answer' });
  }
});

router.put('/:id/verify', authMiddleware, roleMiddleware('faculty'), async (req, res) => {
  try {
    const answerDoc = await db.collection('answers').doc(req.params.id).get();
    if (!answerDoc.exists) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    await db.collection('answers').doc(req.params.id).update({ isVerified: true });
    const answer = answerDoc.data();
    const userDoc = await db.collection('users').doc(answer.postedBy).get();
    if (userDoc.exists) {
      const user = userDoc.data();
      await db.collection('users').doc(answer.postedBy).update({ reputation: user.reputation + 25 });
    }
    res.json({ id: answerDoc.id, ...answerDoc.data(), isVerified: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to verify answer' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const answerDoc = await db.collection('answers').doc(req.params.id).get();
    if (!answerDoc.exists) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const answer = answerDoc.data();
    if (answer.postedBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    await db.collection('answers').doc(req.params.id).delete();
    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete answer' });
  }
});

module.exports = router;
