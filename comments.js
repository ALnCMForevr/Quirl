const Comment = require('../models/comment')
const Question = require('../models/q')

module.exports.submitComment = async (req, res) => {
    const question = await Question.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id
    question.comments.push(comment);
    await comment.save();
    await question.save();
    res.redirect(`/q/${question._id}`)
}

module.exports.deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    await Question.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/q/${id}`)
}