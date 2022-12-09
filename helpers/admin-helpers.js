const bcrypt = require('bcrypt')
const AdminDb = require('../model/Adminmodel')
const userDb = require('../model/UsersData')
const productDb = require('../model/Product')
const categoryDb = require('../model/Categories')
const Orders = require('../model/OrderModel')
const Banner = require('../model/bannerModel')
const Brand = require('../model/brandModel')
const Coupon = require('../model/couponModel')

const mongoose = require('mongoose')
const { use } = require('../routes/user')
const { payment } = require('paypal-rest-sdk')
const Product = require('../model/Product')
module.exports = {


    adminLogin: (adminData) => {
        return new Promise((resolve, reject) => {
            AdminDb.find({ adminEmail: adminData.adminemail }).then((admin) => {  //it returns an array

                if (admin[0]) {

                    bcrypt.compare(adminData.password, admin[0].adminPassword).then((status) => {

                        if (status) {
                            Orders.aggregate([
                            {$match:{}}
                            ])
                            resolve(status)
                        }
                        else {
                            resolve(false)
                        }
                    })
                }
                else {

                    resolve(false)
                }
            })
        })
    },

    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            userDb.find({}).then((users) => {
                resolve(users)
            })
        })

    },

    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            userDb.findByIdAndUpdate(userId, { $set: { status: false } }).then(() => {
                resolve({ blockStatus: true })

            })
        })
    },

    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            userDb.findByIdAndUpdate(userId, { $set: { status: true } }).then(() => {
                resolve({ unBlockStatus: true })

            })
        })
    },


    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            productDb.findByIdAndDelete(productId).then(() => {
                resolve({ deleteStatus: true })
            })
        })
    },

    deleteCategory: (catId) => {
        return new Promise((resolve, reject) => {
            categoryDb.findByIdAndDelete(catId).then(() => {
                resolve({ deleteStatus: true })
            })

        })
    },


    deleteOneImage: (productId, imageId) => {
        return new Promise((resolve, reject) => {
            productDb.findByIdAndUpdate(productId, { $pull: { image: imageId } }).then(() => {
                resolve({ imgRemoved: true })
            })
        })



    },

    getAllOrders: () => {
        return new Promise((resolve, reject) => {
            Orders.aggregate([
                
                { $sort: { date: -1 } }
            ]).then((data) => {
      
                resolve(data)
            })
        })
    },



    getOneOrder: (orderId, ProductId) => {

        return new Promise((resolve, reject) => {
            orderId = mongoose.Types.ObjectId(orderId)
            ProductId = mongoose.Types.ObjectId(ProductId)
            Orders.aggregate([
                { $match: { _id: orderId } },
                { $project: { product: 1,OrderAddress: 1  } },
                { $unwind: '$product' },
                { $match: { 'product.productId': ProductId } }
            ]).then((product) => {
                    
                    resolve(product)
                })
            
        })
    },

    changeStatus: (orderId, productId, status) => {
        orderId = mongoose.Types.ObjectId(orderId)
        productId = mongoose.Types.ObjectId(productId)
        return new Promise((resolve, reject) => {
            if (status === 'Refund') {
                let coupon = 0
                Orders.findOne({ _id: orderId }).then((order) => {
                    if (order.coupon) {
                        coupon = order.discount / order.product.length
                    }
                    Orders.aggregate([
                        { $match: { _id: orderId } },
                        { $project: { product: 1 } },
                        { $unwind: '$product' },
                        { $match: { 'product.productId': productId } }

                    ]).then((data) => {
                        let price = data[0].product.Price - coupon
          

                        userDb.findOneAndUpdate({ _id: order.userId }, { $inc: { wallet: price } }).then((data) => {
                            Orders.findOneAndUpdate({ _id: orderId, 'product.productId': productId },
                                { $set: { 'product.$.status': "Refund Compleate" } }).then(() => {
                                    resolve({ status: true })
                                })
                        })
                    })
                })
            }
            else {
                Orders.findOneAndUpdate({ _id: orderId, 'product.productId': productId },
                    { $set: { 'product.$.status': status } }
                ).then((data) => {
                    resolve({ status: true })
                })
            }

        })
    },

    getReportByWeek: (dateDetails) => {
        return new Promise((resolve, reject) => {
            const startDate = `${dateDetails.from}T00:00:00`;
            const endDate = `${dateDetails.to}T23:59:59`;
            Orders.aggregate([
                { $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } }
            ]).then((data) => {
                resolve({ status: true, data })
            })
        })
    },
    getReportByMonth: (dateDetails) => {
        return new Promise((resolve, reject) => {
            const startDate = `${dateDetails.from}-01T00:00:00`;
            const endDate = `${dateDetails.to}-31T23:59:59`;
            Orders.aggregate([
                { $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } }
            ]).then((data) => {
                resolve({ status: true, data })
            })
        })
    },

    getReportByYear: (dateDetails) => {
        return new Promise((resolve, reject) => {
            const startDate = `${dateDetails.from}-01-01T00:00:00`;
            const endDate = `${dateDetails.to}-12-31T23:59:59`;
            Orders.aggregate([
                { $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } }
            ]).then((data) => {
                resolve({ status: true, data })
            })
        })
    },

    getSingeleOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            orderId = mongoose.Types.ObjectId(orderId)
            Orders.aggregate([{ $match: { _id: orderId } },
            { $project: { product: 1, OrderAddress: 1, orderTotal: 1, Payment: 1, PaymentStatus: 1 } },
            { $unwind: '$product' }
            ]).then((data) => {
                resolve({ status: true, data })
            })
        })
    },

    getDashbord: () => {
        return new Promise((resolve, reject) => {
            let today = new Date().toString()
            today = today.split(' ')
            let Today = today[2]
            let month = new Date().toString()
            month = month.split(' ')
            let year = new Date()
            Orders.aggregate([{
                $match:{}
            }
            ]).then((order)=>{
                resolve(order)
            })
        })
    },

    addBanner: (bannerDetails, image) => {
        return new Promise((resolve, reject) => {
            let banner = new Banner({
                banners: image,
                bannerTitle: bannerDetails.title,
                bannerDiscription: bannerDetails.discription
            })
            banner.save().then(() => {
                resolve(true)
            })
        })
    },

    getBanners: () => {
        return new Promise((resolve, reject) => {
            Banner.find({}).then((data) => {
                resolve(data)
            })
        })
    },

    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            Banner.findOneAndDelete({ _id: id }).then(() => {
                resolve(true)
            })
        })
    },

    addBrand: (brandDetails, image) => {
   
        return new Promise((resolve, reject) => {
            Brand.aggregate([
                { $match: { brandName: brandDetails.brandName } }

            ]).then((data) => {
     

                if (data.length > 0) {

                    resolve({ addStatus: false })
                }
                else {
                    let brand = new Brand({
                        brandName: brandDetails.brandName,
                        image: image,
                        discription: brandDetails.description,
                        offer: 0
                    })
                    brand.save().then(() => {
                        resolve({ addStatus: true })
                    })

                }
            })

        })

    },

    getAllBrands: () => {
        return new Promise((resolve, reject) => {
            Brand.find({}).then((data) => {
                resolve(data)
            })
        })

    },

    deleteBrand: (brandId) => {
        brandId = mongoose.Types.ObjectId(brandId)
        return new Promise((resolve, reject) => {
            Brand.findByIdAndRemove(brandId).then((data) => {
                resolve({ status: true })
            })
        })

    },

    getOneBrand: (brandId) => {
        brandId = mongoose.Types.ObjectId(brandId)
        return new Promise((resolve, reject) => {
            Brand.aggregate([{ $match: { _id: brandId } }]).then((data) => {
                resolve(data)
            })
        })
    },

    addCoupon: (couponData) => {
        return new Promise((resolve, reject) => {
            Coupon.aggregate([{ $match: { code: couponData.couponCode } }]).then((data) => {
                if (data.length > 0) {
                    resolve({ status: false })
                }
                else {
                    let coupon = new Coupon({
                        code: couponData.couponCode,
                        discount: couponData.discount,
                        maxLimit: couponData.maxLimit,
                        minLimit: couponData.minLimit,
                        Expire: couponData.expDate,
                        status: true
                    })
                    coupon.save().then(() => {
                        resolve({ status: true })
                    })
                }
            })



        })


    },
    getAllCoupons:()=>{
        return new Promise((resolve, reject) => {
            Coupon.find({}).then((coupoon)=>{
                resolve(coupoon)
            })
        })
    },

    deleteCoupon:(code)=>{
        return new Promise((resolve, reject) => {
            Coupon.findOneAndDelete({code:code}).then((data)=>{
                if(data){
                    resolve(true)
                }
            })
        })

    },

    oneOrder:(orderId)=>{
        orderId = mongoose.Types.ObjectId(orderId)
        return new Promise((resolve, reject) => {
            Orders.aggregate([
                { $match: { _id: orderId } },
             
                { $unwind: '$product' },
               
            ]).then((data)=>{
                console.log(data);
               resolve(data)
            })
        })

    },

    categorySalesReport:(categories)=>{

        return new Promise( (resolve, reject) => {
            let report = []
             categories.forEach( element => {
                Orders.aggregate([{ $match: { 'product.category': element.catName } }]).then((data)=>{
                   report.push({category:element.catName,sale:data.length})
                }).then(()=>{
                    if (report.length==categories.length) {
                        console.log(report)
                        resolve({status:true,report})
                    }
                })
                
            })
          
            
        })

    },
    getPaymentReport:()=>{
        return new Promise((resolve, reject) => {
            let paymentMethods = ['COD','razorPay',"Paypal"]
            paymentReport = []
            paymentMethods.forEach(element=>{
                Orders.aggregate([
                    { $match: { Payment: element } }
                ]).then((data)=>{
                    paymentReport.push({payment:element,used:data.length})
                }).then(()=>{
                    if (paymentReport.length == paymentMethods.length) {
                        resolve({status:true , paymentReport})
                    }
                })
                

            })

        })
        

    
    },

    productSearch:(searchText)=>{
        return new Promise((resolve, reject) => {
            Product.find()
        })
    } 


}