const { cloudinary } = require('../cloudinary');
const Question = require('../models/q')

module.exports.index = async (req, res) => {
    const questions = await Question.find({}).populate('author');
    res.render('q/index', { questions })
}

module.exports.renderNewPost = (req, res) => {
    res.render('q/submit')
}

module.exports.createNewPost = async (req, res, next) => {
    const question = new Question(req.body.question);
    question.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    question.author = req.user._id;
    await question.save();
    res.redirect(`/q/${question._id}`)
}

module.exports.renderQuestionShowPage = async (req, res) => {
    const question = await Question.findById(req.params.id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!question) {
        req.flash('error', 'This post is no longer available');
        return res.redirect('/')
    }
    res.render('q/show', { question });
}

module.exports.renderQuestionEdit = async (req, res) => {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) {
        req.flash('error', 'This post is no longer available');
        return res.redirect('/')
    }
    res.render('q/edit', { question });
}

module.exports.submitQuestionEdit = async (req, res) => {
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(id, { ...req.body.question });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    question.images.push(...imgs);
    await question.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await question.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    res.redirect(`/q/${question._id}`)
}

module.exports.deleteQuestion = async (req, res) => {
    const { id } = req.params;
    await Question.findByIdAndDelete(id);
    res.redirect('/q');
}