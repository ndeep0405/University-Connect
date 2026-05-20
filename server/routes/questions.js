const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { db } = require('../firebase');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, department, subject, unanswered, postedBy } = req.query;
    let query = db.collection('questions');

    if (department) {
      query = query.where('department', '==', department);
    }
    if (subject) {
      query = query.where('subject', '==', subject);
    }

    if (postedBy) {
      query = query.where('postedBy', '==', postedBy);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const questions = [];

    for (const doc of snapshot.docs) {
      const question = { id: doc.id, ...doc.data() };
      const userDoc = await db.collection('users').doc(question.postedBy).get();
      if (userDoc.exists) {
        question.postedBy = { id: userDoc.id, name: userDoc.data().name, role: userDoc.data().role, department: userDoc.data().department };
      }

      const answersSnapshot = await db.collection('answers').where('questionId', '==', doc.id).get();
      question.answerCount = answersSnapshot.size;

      if (unanswered === 'true' && question.answerCount > 0) continue;
      if (search) {
        const searchLower = search.toLowerCase();
        if (!question.title.toLowerCase().includes(searchLower) && !question.tags.some(tag => tag.toLowerCase().includes(searchLower))) continue;
      }

      questions.push(question);
    }

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load questions' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, body, department, subject, tags } = req.body;
    if (!title || !body || !department || !subject) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newQuestion = {
      title,
      body,
      department,
      subject,
      tags: tags || [],
      postedBy: req.user.id,
      answers: [],
      views: 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('questions').add(newQuestion);
    res.status(201).json({ id: docRef.id, ...newQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create question' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('questions').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const question = { id: doc.id, ...doc.data() };
    const userDoc = await db.collection('users').doc(question.postedBy).get();
    if (userDoc.exists) {
      question.postedBy = { id: userDoc.id, name: userDoc.data().name, role: userDoc.data().role, department: userDoc.data().department };
    }

    // Update views
    await db.collection('questions').doc(req.params.id).update({ views: question.views + 1 });
    question.views += 1;

    const answersSnapshot = await db.collection('answers').where('questionId', '==', req.params.id).get();
    const answers = [];
    for (const answerDoc of answersSnapshot.docs) {
      const answer = { id: answerDoc.id, ...answerDoc.data() };
      const answerUserDoc = await db.collection('users').doc(answer.postedBy).get();
      if (answerUserDoc.exists) {
        answer.postedBy = {
          id: answerUserDoc.id,
          name: answerUserDoc.data().name,
          role: answerUserDoc.data().role,
          reputation: answerUserDoc.data().reputation,
          department: answerUserDoc.data().department,
        };
      }
      answers.push(answer);
    }

    answers.sort((a, b) => {
      if (a.isVerified === b.isVerified) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.isVerified ? -1 : 1;
    });

    res.json({ ...question, answers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch question' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`[DELETE] Attempting to delete question: ${req.params.id}`);
    console.log(`[DELETE] User: ${req.user.id}, Role: ${req.user.role}`);

    const doc = await db.collection('questions').doc(req.params.id).get();
    if (!doc.exists) {
      console.log(`[DELETE] Question not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Question not found' });
    }

    const question = doc.data();
    console.log(`[DELETE] Question creator: ${question.postedBy}`);
    
    const isOwner = question.postedBy === req.user.id;
    const isAdmin = req.user.role === 'admin';

    console.log(`[DELETE] Is owner: ${isOwner}, Is admin: ${isAdmin}`);

    if (!isOwner && !isAdmin) {
      console.log(`[DELETE] Permission denied for user ${req.user.id}`);
      return res.status(403).json({ message: 'You do not have permission to delete this question' });
    }

    // Delete all answers for this question
    const answersSnapshot = await db.collection('answers').where('questionId', '==', req.params.id).get();
    console.log(`[DELETE] Found ${answersSnapshot.size} answers to delete`);
    
    for (const answerDoc of answersSnapshot.docs) {
      await answerDoc.ref.delete();
    }

    // Delete the question
    await db.collection('questions').doc(req.params.id).delete();

    console.log(`[DELETE] Successfully deleted question: ${req.params.id}`);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(`[DELETE ERROR] ${error.message}`, error);
    res.status(500).json({ message: `Unable to delete question: ${error.message}` });
  }
});

module.exports = router;
