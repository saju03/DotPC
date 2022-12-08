
const Brand = require('../model/brandModel')
const mongoose = require('mongoose')
const Product = require('../model/Product')

module.exports={

    addBrandOffer:(offer,brandId)=>{
        brandId = mongoose.Types.ObjectId(brandId)
        return new Promise((resolve, reject) => {
            Brand.findOneAndUpdate({_id:brandId},{$set:{offer:offer}}).then((data)=>{
                if (data) {
                    resolve(true)
                }
            })
        })
    },

    setBrandOffer:(offer,brandId)=>{
        brandId = mongoose.Types.ObjectId(brandId)
        return new Promise((resolve, reject) => {
            Brand.findOne({_id:brandId}).then((brand)=>{
                console.log(brand);
            brandName = brand.brandName;
             Product.updateMany({brand:brandName},{$set:{brandOffer:offer}}).then((data)=>{
                console.log(data);
                resolve(true)
             })
            })
        })
    }

    
}