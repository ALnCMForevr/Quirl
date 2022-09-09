const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})



module.exports = mongoose.model("Comment", commentSchema);

