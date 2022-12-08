const mongoose =require('mongoose')

 const Schema = mongoose.Schema

const BannerSchema= new Schema({
    banners:String,
    bannerTitle:String,
    bannerDiscription:String
})
    
module.exports = mongoose.model('Banner',BannerSchema)