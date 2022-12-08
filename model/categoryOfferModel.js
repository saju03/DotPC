const mongoose =require('mongoose')

 const Schema = mongoose.Schema

const categoryOffer= new Schema({
    brandName:String,
    discount:Number
})
    
module.exports = mongoose.model('brandOffer',categoryOffer)