const  mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const ProductSchema= new Schema({
    name:String,
    brand:String,
    description:String,
    image:[],
    price:Number,
    category:String,
    productOffer:Number,
    brandOffer:Number,
    regularPrice:Number
})

module.exports=mongoose.model('Product',ProductSchema)