const mongoose =require('mongoose')

 const Schema = mongoose.Schema

const walletSchema= new Schema({
  user:mongoose.ObjectId,
  balance:Number
})
    
module.exports = mongoose.model('wallet',walletSchema)