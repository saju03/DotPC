const mongoose =require('mongoose')
const { schema } = require('./Product')
 const Schema = mongoose.Schema

const wishlistSchema = new Schema({
    user:mongoose.ObjectId,
    ProductList:[mongoose.ObjectId]

})
module.exports = mongoose.model('Wishlist',wishlistSchema)