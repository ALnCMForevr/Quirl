const express = require('express');
const router = express.Router();
const questions = require('../controllers/questions')
const catchAsync = require('../utils/catchAsync');
const Question = require('../models/q')
const { isLoggedIn, validateQuestion, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(questions.index))
    .post(isLoggedIn, upload.array('image'), validateQuestion, catchAsync(questions.createNewPost))

router.get('/submit', isLoggedIn, questions.renderNewPost)

router.route('/:id')
    .get(catchAsync(questions.renderQuestionShowPage))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateQuestion, catchAsync(questions.submitQuestionEdit))
    .delete(isLoggedIn, isAuthor, catchAsync(questions.deleteQuestion))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(questions.renderQuestionEdit))

//submit a post


module.exports = router;