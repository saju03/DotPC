const  mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const CouponSchema = new Schema({
    code:String,
    discount:Number,
   maxLimit:Number,
    Expire:Date,
    status:Boolean,
    minLimit:Number,
    status:Boolean    
})

module.exports=mongoose.model('Coupon',CouponSchema)