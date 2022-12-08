const  mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema=new Schema({
    userName:String,
    userEmail:String,
    userPhone:Number,
    userPassword:String,
    status:Boolean,
    date:String,
    address:[{
        name:String,
        place:String,
        mobile:Number,
        house:String,
        area:String,
        city:String,
        district:String,
        state:String,
        pin:Number
    }],
    referalCode:String,
    wallet:Number
})
module.exports = mongoose.model('userdata',UserSchema)