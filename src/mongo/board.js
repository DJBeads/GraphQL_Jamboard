const mongoose = require('mongoose');

const BoardSchema= new mongoose.Schema({
    post: [{
        text:String,
        author:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        x:Number,
        y:Number
    }],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    editor:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const Board = mongoose.model('Board',BoardSchema);

module.exports = Board;