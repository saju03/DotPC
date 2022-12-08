const mongoose =require('mongoose')

 const Schema = mongoose.Schema

const brandOffer= new Schema({
    brandName:String,
    discount:Number
})
    
module.exports = mongoose.model('brandOffer',brandOffer)