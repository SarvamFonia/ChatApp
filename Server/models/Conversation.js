const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    members: {
        type : Array,
        require: true
    },
    
});
const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;