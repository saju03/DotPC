const  mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminSchema=new Schema({
    
    adminEmail:String,
    
   adminPassword:String,
    
})
module.exports = mongoose.model('admindata',AdminSchema)