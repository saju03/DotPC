const  mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const CategorySchema= new Schema({
   catName:String,
   catDiscription:String
})



module.exports=mongoose.model('category',CategorySchema)