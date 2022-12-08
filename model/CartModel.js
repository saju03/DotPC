const mongoose =require('mongoose')
const { schema } = require('./Product')
 const Schema = mongoose.Schema

const cartSchema= new Schema({
    user:String,
    ProductList:[{
        ProductId:mongoose.ObjectId,
        COUNT:Number
    }],
    total:Number,
    couponStatus:Boolean,
    discount:Number,
    couponMin:Number
    

})
module.exports = mongoose.model('cart',cartSchema)