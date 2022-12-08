const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema=new Schema({
    userId:mongoose.ObjectId,
    date:Date,
    product:[],
    status:String,
    count:Number,
    coupon:Boolean,
    discount:Number,
    OrderAddress:{
        name:String,
        place:String,
        mobile:Number,
        city:String,
        state:String,
        pin:Number
    },
    orderTotal:Number,
    Payment:String,
    PaymentStatus:String,
   
   
    
})


module.exports=mongoose.model('Orders',OrderSchema)