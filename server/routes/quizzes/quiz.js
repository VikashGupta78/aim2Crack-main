const express = require('express');
const router = express.Router();
const Quiz = require('../../models/quiz');
const FacultyAuthorization = require('../../controllers/facultyAuthorisation');


// Create a quiz
router.post('/quizzes',FacultyAuthorization, async (req, res) => {
    const user=req.user;
    try {
        const { startTime, marginTime, resultTime, quizName, sectionName} = req.body;

        // Create a new quiz in the database
        const quiz = await Quiz.create({
            code: 1234,
            startTime,
            marginTime,
            resultTime,
            quizName,
            sectionName,
            creator: user,
            collaborators
        });

        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Get all quizzes
router.get('/quizzes', async (req, res) => {
    try {
        // Fetch all quizzes from the database
        const quizzes = await Quiz.findAll();

        res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//access quiz by id
router.get('/quizzes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find a quiz by its ID in the database
        const quiz = await Quiz.findByPk(id);

        if (quiz) {
            res.status(200).json({ success: true, data: quiz });
        } else {
            res.status(404).json({ success: false, message: 'Quiz not found' });
        }
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// quiz updation
router.put('/quizzes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, marginTime, resultTime, quizName, sectionName, creator, collaborators } = req.body;

        // Find the quiz by ID and update its properties
        const quiz = await Quiz.findByPk(id);
        if (quiz) {
            quiz.code = code;
            quiz.startTime = startTime;
            quiz.marginTime = marginTime;
            quiz.resultTime = resultTime;
            quiz.quizName = quizName;
            quiz.sectionName = sectionName;
            quiz.creator = creator;
            quiz.collaborators = collaborators;

            await quiz.save();

            res.status(200).json({ success: true, data: quiz });
        } else {
            res.status(404).json({ success: false, message: 'Quiz not found' });
        }
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//quiz deletion
router.delete('/quizzes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the quiz by ID and delete it
        const quiz = await Quiz.findByPk(id);
        if (quiz) {
            await quiz.destroy();
            res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Quiz not found' });
        }
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
