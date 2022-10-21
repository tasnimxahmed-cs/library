const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    books: [{
        title: String,
        author: String,
        publish_date: String,
        number_of_pages: String,
        publisher: String,
        isbn_13: String,
        isbn_10: String,
        description: String
    }]
})

const User = mongoose.model("User", user)

module.exports = User