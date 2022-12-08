const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const brandSchema = new Schema({
    brandName:String,
    discription:String,
    image:String,
    offer:Number
})
module.exports = mongoose.model('brand',brandSchema)