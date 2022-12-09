const express = require('express');
const userHelper = require('../helpers/user-helpers');
const userController = require('../Controller/user-Controller');
const { response } = require('express');

const userHelpers = require('../helpers/user-helpers');
const mongoose = require('mongoose');
const { resolveInclude } = require('ejs');
const router = express.Router();




/* GET home page. */
router.get('/', userController.getDashbord);

/*GET AND POST LOGIN PAGE */
router.route('/login')
  .get(userController.getUserLogin)
  .post(userController.postUserLogin)
/*=======================================*/



/*GET SIGNUP FORM=================================== */

router.get('/signup', userController.getUserSignup)
/*==================================================*/


/*GET ALL PRODUCTS TO DASHBORD =================================== */

router.get('/product-details/:id', userController.getProductDetails)
/*================================================================*/

/*POST SIGNUP FORM=======================================*/

router.post('/signup', userController.postUserSignup)
/*==================================================*/


/*GET OTP MOBILE NUM FORM=========================*/

router.get('/otp-login', userController.getUserMobile)
/*==================================================*/



/*POST OTP MOBILE NUM FORM=========================*/

router.post('/otp-login', userController.postVerifyUserMobile)
/*=======================================================*/



/*VERIFY MOBILE NUM AND SEND OTP =========================*/

router.get('/verify-otp', userController.getVerifyOtp)
/*=======================================================*/



/*VERIFY VERIFY OTP =======================================*/

router.post('/otp-verify/:phone', userController.postOtpVerify)
/*===========================================================*/



/*LOGOUT======================================*/
router.get('/logout', userController.getLogout)
/*=============================================*/

router.get('/cart', userController.getCart)

router.get('/add-to-cart/:id', userController.addToCart)

//                  CHANGE THIS TO OTHER HTTP METHODS
/*------------------------------------------------------------------ */
router.get('/remove-from-cart/:id', userController.deleteFromCart)

router.post('/change-product-count', userController.changeProductQuantity)
/*------------------------------------------------------------------------*/

router.get('/checkout', userController.getCheckout)

router.get('/my-profile/address', userController.getMyAddress)

router.post('/add-address', userController.postAddAddress)

router.post('/checkout', userController.postCheckout)

router.get('/my-profile/view-orders', userController.getUserOrders)

router.get('/change-order-status/:productId/:orderId', userController.getChangeOrderStatus)

router.get('/return-order-status/:productId/:orderId',userController.returnOrderStatus)

router.get('/profile',userController.getUserProfile)

router.get('/ordered-product/:id', userController.getSingleOrderedProduct)

router.delete('/my-account/address/delete',userController.deleteUserAddress)

router.get('/my-profile/edit',userController.editProfile )

router.get("/change-password", userController.sentOtpToUserMobile)

router.post('/verifyOtp', userController.verifyOtp)

router.post("/changepassword",userController.postChangePassword)

router.get('/add-to-wish/:productId',userController.addToWishlist)

router.get('/my-wishlist',userController.getUserWishlist)

router.get('/remove-from-wishlist/:productId',userController.removefromWishlist )

router.get('/addto-cart-from-wishlist/:productId',userController.addToCartFromWish)

router.post('/verify-payment',userController.verifyPayment)

router.get('/success',userController.paypalSuccessPage);

router.get('/order-placed',userController.orderPlaced);

router.post('/my-profile/edit',userController.postEditProfile)

router.get("/filter-brand/:brand",userController.filterBrand)

router.post('/verify-coupon',userController.verifyCoupon)

router.post('/apply-coupon',userController.applyCoupon)

router.get('/my-profile/wallet',userController.getWallet)

router.post('/shop-search',(req,res)=>{
userHelper.productSearch(req.body)
  
})
module.exports = router;





//validataion ordrer placed cart clear popups