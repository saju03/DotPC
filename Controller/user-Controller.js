
const productHelpers = require('../helpers/product-helpers');
const categoryHelper = require('../helpers/categories-manage')
const userHelper = require('../helpers/user-helpers')
const session = require('express-session')
const SSID = 'VA71182f6380a952b0e18a70675bb3e6c8'
const CC = require('currency-converter-lt')
const paypal = require('paypal-rest-sdk');
const mongoose = require('mongoose');
const brands = require("../model/brandModel")
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');



paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id':process.env.paypalClientID,
  'client_secret': process.env.paypalClientSecret
});



const client = require('twilio')(process.env.ASID, process.env.AUTH)


module.exports = {

  getDashbord: (req, res) => {

    userHelpers.getBanners().then((banners) => {
      productHelpers.getAllProducts().then((product) => {
      
        adminHelpers.getAllBrands().then((brands) => {
          categoryHelper.getAllCategories().then((categories) => {
            let user = req.session.user
            if (req.session.userlogged) {
              res.render('user/index', { product, user, banners, brands, categories })
            }
            else {
              res.render('user/index', { product, user: false, banners, brands, categories })
            }
          })

        })
      })
    })
  },


  getUserLogin: (req, res) => {
    if (req.session.userlogged) {
      res.redirect('/')
    }
    else {
      console.log(req.session.passwordNotMatch);
      if (req.session.passwordNotMatch) {
        let passwordNotMatch = req.session.passwordNotMatch
        req.session.passwordNotMatch=false
        res.render('user/user-login',{passwordNotMatch,userBlocked:false,noUser:false})
      }
      if (req.session.noUser) {
        let noUser = req.session.noUser
        req.session.noUser=false
        res.render('user/user-login',{passwordNotMatch:false,userBlocked:false,noUser})
      }
      if (req.session.userBlocked) {
        let userBlocked = req.session.userBlocked
        req.session.userBlocked = false
        res.render('user/user-login',{passwordNotMatch:false,userBlocked,noUser:false})
      }
      else{
        res.render('user/user-login',{passwordNotMatch:false,userBlocked:false,noUser:false})
      }
    
      
    }

  },

  getProductDetails: (req, res) => {
    let user = req.session.user
    userHelper.getUserProduct(req.params.id).then((productDetails) => {
      categoryHelper.getAllCategories().then((categories) => {
        res.render('user/product-details', { productDetails, user, categories })
      })

    })
  },

  getUserSignup: (req, res) => {
    res.render('user/user-signup', { exist: null, errMessage: null })
  },

  postUserSignup: (req, res) => {


    userHelper.signupUser(req.body).then((response) => {
      if (response.alredyExist) {

        res.json({ exist: true })

      }
      else {
        res.json({
          exist: false
        })

      }
    })
  },



  postUserLogin: (req, res) => {

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    userHelper.userLogin(req.body).then((response) => {
      if (response.userLogin) {
        req.session.userlogged = true

        req.session.user = response.user
        res.redirect('/')
      }

      else {
        if (response.noUser) {
          req.session.noUser = true
          res.redirect('/login')
        }
        if (response.userBlocked) {
          req.session.userBlocked = true
          res.redirect('/login')
        }
        if (response.passwordNotMatch) {
          req.session.passwordNotMatch = true
          res.redirect('/login')
        }
      
        
        

      }
    })

  },

  getLogout: (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    req.session.userlogged = false
    res.redirect('/')
  },


  getUserMobile: (req, res) => {
    if (req.session.userlogged) {
      res.redirect('/')
    }
    else {

      if (req.session.noUser) {
        let noUser = req.session.noUser
        res.render('user/get-mobile', { noUser })
      }
      else {
        res.render('user/get-mobile', { noUser: null })
      }
    }


  },

  postVerifyUserMobile: (req, res) => {
    userHelper.verifyUserMobile(req.body.phone).then((status) => {
      if (status.findUser) {
        let user = status.user
      

        client.verify.services(SSID).verifications.create({
          to: `+91${user.userPhone}`,

          channel: 'sms'
        })
        req.session.verifiedMobileUser = user;
        res.redirect("/verify-otp")
      }
      else {
        req.session.noUser = true
        res.redirect("/otp-login")

      }
    })
  },


  postOtpVerify: (req, res) => {
    userHelper.getUserDataByPhone(req.params.phone).then((userData) => {

      client.verify
        .services(SSID)
        .verificationChecks.create({
          to: `+91${req.params.phone}`,
          code: req.body.code,
        }).then((data) => {
          if (data.status === "approved") {
            req.session.userlogged = true
            req.session.user = userData
            res.redirect('/')
          }
          else {
            res.redirect('/verify-otp')
          }
        })

    })

  },

  getVerifyOtp: (req, res) => {


    if (req.session.userlogged) {
      res.redirect('/')
    }
    else {
      let user = req.session.verifiedMobileUser;
      res.render('user/verify-otp', { user })
    }

  },

  getCart: (req, res) => {
    if (req.session.user) {
      let user = req.session.user
      userHelper.getUserCart(user._id).then((response) => {
        let cartProducts = response.ITEM
        SubTotal = response.SubTotal,
        COUPON = response.COUPON,
        discount = response.discount

        res.render('user/cart', { cartProducts, user, SubTotal, COUPON,discount })
      })
    } else {
      res.redirect('/login')
    }

  },

  addToCart: (req, res) => {
    if (req.session.userlogged) {
      userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
        if (response.status) {
          res.json({ status: true })
        }
        else {
          console.log('cart error');
        }
      })
    }
    else {
      res.redirect('/login')
    }
  },


  deleteFromCart: (req, res) => {
    userHelper.deleteFromCart(req.session.user._id, req.params.id).then((status) => {
      if (status) {
        res.redirect('/cart')
      }
    })
  },

  changeProductQuantity: (req, res) => {

    userHelper.changeProductCountUp(req.body.product, req.session.user._id, req.body.count).then((response) => {
      if (response.status) {
        let subTotal = response.subTotal;
        res.json({ status: true, subTotal })
      }
    })

  },

  getCheckout: (req, res) => {

    if (req.session.userlogged) {
      let user = req.session.user
      userHelper.getUserCart(req.session.user._id).then((cartItems) => {
        if (cartItems) {
          userHelper.getUserAddress(user._id).then((address) => {

            userHelper.getUserData(req.session.user._id).then((user)=>{
             
              let userData = user[0]
              user = user[0]
              let products = cartItems.ITEM
            let total = cartItems.SubTotal
            ITEM = cartItems.ITEM
            console.log(cartItems);
            console.log('...............................................');

            let cartRegularTotal = 0
            ITEM.forEach(element=>{
              cartRegularTotal +=  element.price*element.count

            })

         

            res.render("user/checkout", { cartItems, user, cartRegularTotal, products, total, address,userData })
            })
            
          })

        }
      })
    }
    else {
      res.redirect('/login')
    }
  },

  getMyAddress: (req, res) => {

    if (req.session.user) {
      let user = req.session.user
      userHelper.getUserAddress(user._id).then((addressList) => {

        res.render('user/my-address', { user, addressList})
      })

    } else {
      res.redirect('/login')
    }

  },

  postAddAddress: (req, res) => {

    console.log(req.body);
    console.log('--------------------------------------------------------');
    userHelper.addAddress(req.session.user._id, req.body).then((data) => {
      res.json({ status: true })
    })
  },

  postCheckout: (req, res) => {

if(req.body.wallet=="true"){
  req.body.wallet = true
}else{
  req.body.wallet=false
}


    userHelper.placeOrder(req.session.user._id, req.body.address, req.body.payment, req.body.wallet).then((response) => {
      if (response.status) {
        userHelper.clearCart(req.session.user._id).then(() => {

          if (req.body.payment == "COD") {
            res.json({ COD: true, response })
          }
          else if (req.body.payment == "razorPay") {
            userHelper.generateRazorPay(response.orderId, response.orderTotal).then((response) => {

              res.json({ razorPay: true, response })

            })

          } else if (req.body.payment == "Paypal") {

            userHelper.generatePaypal(response.orderId, response.USD).then((response) => {
              res.json({ Paypal: true, response })

            })

          } else if(req.body.payment == 'wallet') {
            userHelper.walletPayment(response.orderId, response.USD, req.session.user._id).then((response)=>{
              if(response){
                res.json({wallet:true})
              }
            })
          }

        })
      }
    })
  },

  getUserOrders: (req, res) => {
    if (req.session.user) {
      let user = req.session.user

      userHelper.getOrdersUser(user._id).then((response) => {
        let orders = response.order;
        res.render('user/orders', { user, orders })
      })


    }

  },
  getChangeOrderStatus: (req, res) => {
    userHelper.changeOrderStatus(req.params.orderId, req.params.productId).then((response) => {
      res.json({ status: true })
    })
  },


  sentOtpToUserMobile: (req, res) => {

    if (req.session.user) {
      let user = req.session.user

      client.verify.services(SSID).verifications.create({
        to: `+91${req.session.user.userPhone}`,

        channel: 'sms'
      })

      res.render("user/verifyOtp", { user })
    }
    else {
      req.session.noUser = true
      res.redirect("/my-profile/edit")

    }

  },

  verifyOtp: (req, res) => {
    let user = req.session.user
    return new Promise((resolve, reject) => {
      client.verify
        .services(SSID)
        .verificationChecks.create({
          to: `+91${req.session.user.userPhone}`,
          code: req.body.code,
        }).then((data) => {
          if (data.status === "approved") {
            res.render('user/changePassword', { user })
          }
          else {
            res.redirect('/verify-otp')
          }
        })

    })


  },


  getUserProfile: (req, res) => {
    if (req.session.user) {
      const user = req.session.user
      res.render('user/profile', { user })
    }
    else {
      res.redirect('/login')
    }
  },

  getSingleOrderedProduct: (req, res) => {
    if (req.session.user) {
      const orderId = req.params.id
      const user = req.session.user
      userHelper.getSingleOrder(orderId).then((products) => {
        if (products) {
          res.render('user/singleOrder', { products, orderId, user })
        }
      })
    }
    else {
      res.redirect('/login')
    }


  },

  deleteUserAddress: (req, res) => {
    if (req.session.user) {
      userHelper.deleteAddress(req.session.user._id, req.body.addressId).then((response) => {
        if (response.status) {
          res.json(true)
        }
      })
    } else {
      res.redirect('/login')
    }

  },

  editProfile: (req, res) => {
    if (req.session.user) {
      userHelper.getUserData(req.session.user._id).then((data) => {
        if (req.session.user) {
          const user = data
          res.render('user/edit-profile', { user })
        }
        else {
          res.redirect('/login')
        }

      })
    } else {
      res.redirect('/login')
    }


  },

  postChangePassword: (req, res) => {
    if (req.session.user) {

      if (req.body.password == req.body.confirm) {
        userHelper.changePassword(req.body.password, req.session.user._id).then((response) => {
          if (response.status) {
            res.redirect('/my-profile/edit')
          }
        })
      }

    } else {
      res.redirect('/login')
    }

  },

  addToWishlist: (req, res) => {
    userHelper.addToWishlist(req.session.user._id, req.params.productId).then((response) => {
      if (response.added) {
        res.json({ added: true })
      }
      if (response.removed) {
        res.json({ removed: true })
      }
    })
  },


  getUserWishlist: (req, res) => {

    if (req.session.user) {
      const user = req.session.user
      userHelper.getWishlist(user._id).then((response) => {
        
        if (response.status) {
          let Wishlist = response.data
          let wishlist = []
          console.log(Wishlist);
 

          Wishlist.forEach(element => {
            if (element.wishlist.brandOffer>element.wishlist.productOffer) {
               element.wishlist.price=element.wishlist.price - (element.wishlist.price/100*element.wishlist.brandOffer)
            }
            else{
              element.wishlist.price=element.wishlist.price - (element.wishlist.price/100*element.wishlist.brandOffer)
            }
           
            wishlist.push(element)
          });
          
          res.render("user/wishlist", { user, wishlist })
        }

      })

    }
    else {
      res.redirect('/login')
    }
  },

  removefromWishlist: (req, res) => {

    if (req.session.user) {
      let user = req.session.user._id
      userHelper.removeFormWishlist(user, req.params.productId).then((response) => {
        if (response.status) {
          res.json({ status: true })
        }
      })
    }
  },

  addToCartFromWish: (req, res) => {
    if (req.session.user) {
      let user = req.session.user._id
      userHelper.addToCartFromWish(user, req.params.productId).then((response) => {
        if (response.status) {
          res.json({ status: true })
        }
      })
    }

  },

  verifyPayment: (req, res) => {
    userHelper.verifyRazerPayment(req.body).then((response) => {
      if (response.paymentStatus) {
        userHelper.changeOrderPaymentStatus(req.body['order[response][data][receipt]'], req.session.user._id).then((response) => {
          if (response.status) {
            res.json({ url: '/order-placed' })
          }

        })
      }

    })
  },

  paypalSuccessPage: (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": "555"
        }
      }]
    };

    // Obtains the transaction details from paypal
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
        console.log(error.response);
        throw error;
      } else {

        console.log(JSON.stringify(payment.transactions[0].description));

        let orderId = mongoose.Types.ObjectId(payment.transactions[0].description);

        userHelper.changeOrderPaymentStatus(orderId, req.session.user._id).then(() => {
          res.redirect('/order-placed')
        })
      }
    });
  },

  orderPlaced: (req, res) => {
    res.render('user/order-placed')
  },

  returnOrderStatus:(req,res)=>{
    userHelper.returnOrder(req.params.orderId,req.params.productId).then((response)=>{
      res.json({ status: true })
  
    })
  },
  postEditProfile:(req,res)=>{
    userHelper.updateProfile(req.body,req.session.user._id).then((respnse)=>{
      res.redirect('/my-profile/edit')
    })
  },

filterBrand:(req,res)=>{
  userHelper.gerProductByBrands(req.params.brand).then((response)=>{
    if(response.status){
      let products = response.products
       res.render("user/shop",{products})
    }
   
  })
},

verifyCoupon:(req,res)=>{

  userHelper.verifyCoupon(req.body.code,req.session.user._id).then((response)=>{
   res.json(response)
  })
 },
 applyCoupon:(req,res)=>{
  console.log(req.body);
  userHelper.applyCoupon(req.body,req.session.user._id).then((response)=>{
 
    if (response.status) {
     
      res.json(response)
    }
})
},
getWallet:(req,res)=>{
  userHelper.getUserData(req.session.user._id).then((User)=>{
    let user = User[0]
   res.render('user/wallet',{user})
  })
  
   
  
    
  }


}