const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Product = require('../model/Product');
const UserDb = require('../model/UsersData');
const Cart = require('../model/CartModel');
const Orders = require('../model/OrderModel');
const Wishlist = require('../model/wishlistModel')
const CC = require('currency-converter-lt')
const paypal = require('paypal-rest-sdk');
const Banner = require('../model/bannerModel')
const Coupon = require('../model/couponModel')


const Razorpay = require('razorpay');
const { render } = require('ejs');
const { resolve } = require('path');

let razorPay = new Razorpay({
  key_id: process.env.keyID,
  key_secret: process.env.secretKey,
});


module.exports = {
  getUserProduct: (productId) => {
    productId = mongoose.Types.ObjectId(productId);
    return new Promise((resolve) => {
      Product.findById(productId).then((product) => {
        if (product.brandOffer > product.productOffer) {
          product.price = product.price - (product.price / 100 * product.brandOffer)
        } else {
          product.price = product.price - (product.price / 100 * product.productOffer)
        }

        Math.round(product.price)
        resolve(product);
      });
    });
  },


  signupUser: (userSignupData) => new Promise((resolve) => {

    UserDb.find({ userEmail: userSignupData.useremail }).then((response) => {
      bcrypt.hash(userSignupData.userpassword, 10).then((BcryptPswd) => {

        if (response.length != 0) {
          resolve({ alredyExist: true });
        } else {
          UserDb.findOne({ userPhone: userSignupData.userphone }).then((result) => {
            if (result) {
              resolve({ alredyExist: true });
            } else {
              if (userSignupData.refral) {

                UserDb.findOne({ referalCode: userSignupData.refral }).then((data) => {


                  if (data) {



                    const user = new UserDb({
                      userName: userSignupData.username,
                      userEmail: userSignupData.useremail,
                      userPhone: userSignupData.userphone,
                      userPassword: BcryptPswd,
                      date: Date.now(),
                      status: true,
                      wallet: 25,
                      referalCode: Date.now().toString(36)
                    });

                    user.save().then((response) => {

                      UserDb.findOneAndUpdate({ referalCode: userSignupData.refral }, { $inc: { wallet: 20 } }, { upsert: true }).then((data) => {
                        resolve(response);
                      })

                    }).catch((e) => console.log(e));

                  }
                  else {



                    const user = new UserDb({
                      userName: userSignupData.username,
                      userEmail: userSignupData.useremail,
                      userPhone: userSignupData.userphone,
                      userPassword: BcryptPswd,
                      date: Date.now(),
                      status: true,
                      wallet: 10,
                      referalCode: Date.now().toString(36)
                    });

                    user.save().then((response) => {

                      resolve(response);
                    }).catch((e) => console.log(e));


                  }

                })
              }
              else {
                const user = new UserDb({
                  userName: userSignupData.username,
                  userEmail: userSignupData.useremail,
                  userPhone: userSignupData.userphone,
                  userPassword: BcryptPswd,
                  date: Date.now(),
                  status: true,
                  wallet: 10,
                  referalCode: Date.now().toString(36)
                });

                user.save().then((response) => {
                  resolve(response);
                }).catch((e) => console.log(e));




              }


            }
          });
        }
      });
    });
  }),

  userLogin: (userData) => new Promise((resolve) => {
    UserDb.findOne({ userEmail: userData.useremail }).then((user) => {
      if (user) {
        if (user.status) { // THIS STATUS IF FOR CHECK WHETHER THE USER IS BLOCKED OR NOT
          if (user) {
            const response = {};
            bcrypt.compare(userData.password, user.userPassword).then((status) => {
              if (status) {
                response.user = user;
                response.userLogin = true;
                resolve(response);
              } else {
                resolve({ userLogin: false });
              }
            });
          } else {
            resolve({ userLogin: false });
          }
        } else {
          resolve({ userLogin: false });
        }
      } else {
        resolve({ userLogin: false });
      }
    });
  }),

  verifyUserMobile: (mobile) => new Promise((resolve) => {
    UserDb.findOne({ userPhone: mobile }).then((user) => {
      if (user) {
        resolve({ findUser: true, user });
      } else {
        resolve({ findUser: false });
      }
    });
  }),

  getUserData: (userId) => {
    userId = mongoose.Types.ObjectId(userId);
    UserDb.findOne({ _id: userId }).then((data) => {
      resolve(data)
    })
  },

  getUserDataByPhone: (mobileNo) => new Promise((resolve) => {
    UserDb.findOne({ userPhone: mobileNo }).then((userData) => {
      resolve(userData);
    });
  }),

  getUserCart: (userId) => new Promise((resolve) => {
    Cart.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      { $unwind: ('$ProductList') },
      {
        $lookup: {
          from: 'products',
          let: { products: '$ProductList' },
          pipeline: [{
            $match: {
              $expr: {
                $eq: ['$_id', '$$products.ProductId'],
              },
            },
          }],
          as: 'CartList',
        },
      },
      { $unwind: '$CartList' },
    ]).then((data) => {
      if (data.length) {



        const productLIST = data;
        const ITEM = [];
        let SubTotal = 0;
        productLIST.forEach((item) => {
          if (item.CartList.brandOffer > item.CartList.productOffer) {
            item.CartList.price = item.CartList.price - (item.CartList.price / 100 * item.CartList.brandOffer)
          }
          else {
            item.CartList.price = item.CartList.price - (item.CartList.price / 100 * item.CartList.productOffer)
          }



          item.CartList.count = item.ProductList.COUNT;
          ITEM.push(item.CartList);

          SubTotal += (item.CartList.count * item.CartList.price);


          Math.round(SubTotal)
        });


        let COUPON = false
        let discount = 0;
        if (productLIST[0].couponStatus) {
          if (SubTotal > productLIST[0].couponMin) {
            SubTotal = SubTotal - productLIST[0].discount
            discount = productLIST[0].discount
            COUPON = true
          }


        }


        resolve({ ITEM, SubTotal, COUPON, discount });
      }
      else {
        let COUPON = false
        let discount = 0;
        const ITEM = [];
        let SubTotal = 0;
        resolve({ ITEM, SubTotal, COUPON, discount });
      }
    });

  }),


  addToCart: (productId, userId) => new Promise((resolve) => {
    Cart.findOne({ user: userId }).then((data) => {
      if (data) {
        // eslint-disable-next-line max-len
        const ProductExist = data.ProductList.findIndex((product) => product.ProductId == productId);
        if (ProductExist != -1) {
          Cart.updateOne({ user: userId, ProductList: { $elemMatch: { ProductId: productId } } }, { $inc: { 'ProductList.$.COUNT': 1 } }).then((data) => {
            if (data) {
              resolve({ status: true });
            }
          });
        } else {
          Product.findById(productId).then(() => {
            // eslint-disable-next-line max-len
            Cart.updateOne({ user: userId }, { $addToSet: { ProductList: { $each: [{ ProductId: productId, COUNT: 1 }] } } }).then(() => {
              resolve({ status: true });
            });
          });
        }
      } else {
        const cart = new Cart({
          user: userId,
          couponStatus: false,
          discount: 0
        });
        Product.findById(productId).then(() => {
          cart.ProductList.push({
            ProductId: productId,
            COUNT: 1,
          });
          cart.save().then(() => {
            resolve({ status: true });
          });
        });
      }
    });
  }),


  deleteFromCart: (userId, productId) => new Promise((resolve) => {
    Cart.findOneAndUpdate({ user: userId }, {
      $pull: {
        ProductList: { ProductId: productId },
      },
    }).then(() => {
      Cart.findOne({ user: userId }).then((data) => {
        if (data) {
          Cart.aggregate([
            { $match: { user: userId } },
            { $unwind: '$ProductList' },
            {
              $lookup: {
                from: 'products',
                let: { products: '$ProductList' },
                pipeline: [{
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$products.ProductId'],
                    },
                  },
                }],
                as: 'CartList',
              },
            },
            { $unwind: '$CartList' },
          ]).then(async (data) => {
            const total = [];

            data.forEach((element) => {
              total.push(element);
            });
            let sub = 0;
            total.forEach((element) => {


              sub += element.ProductList.COUNT * element.CartList.price;

            });
            await Cart.updateOne({ user: userId }, { $set: { total: sub } }, { upsert: true });
          });
        }
      });
      resolve({ status: true });
    });
  }),

  changeProductCountUp: (productId, userId, count) => new Promise((resolve) => {
    Cart.findOne({ user: userId }).then((data) => {
      if (data) {
        Cart.updateOne({ user: userId, ProductList: { $elemMatch: { ProductId: productId } } }, { $inc: { 'ProductList.$.COUNT': count } }).then(() => {
          Cart.aggregate([
            { $match: { user: userId } },
            { $unwind: '$ProductList' },
            {
              $lookup: {
                from: 'products',
                let: { products: '$ProductList' },
                pipeline: [{
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$products.ProductId'],
                    },
                  },
                }],
                as: 'CartList',
              },
            },
            { $unwind: '$CartList' },
          ]).then(async (data) => {
            const total = [];

            data.forEach((element) => {
              total.push(element);
            });
            let sub = 0;
            total.forEach((element) => {
              sub += element.ProductList.COUNT * element.CartList.price;
            });
            await Cart.updateOne({ user: userId }, { $set: { total: sub } }, { upsert: true });
            resolve({ status: true, subTotal: sub });
          });
        });
      }
    });
  }),

  addAddress: (userId, address) => new Promise((resolve) => {
    UserDb.findOneAndUpdate({ _id: userId }, {
      $push: {
        address: {
          $each: [
            {
              name: address.name,
              place: address.place,
              mobile: address.mobile,
              city: address.city,
              state: address.state,
              pin: address.pin,
            },
          ],
        },
      },
    }).then(() => {
      resolve(true);
    });
  }),

  getUserAddress: (userid) => new Promise((resolve) => {
    UserDb.findOne({ _id: userid }, { address: 1 }).then((data) => {
      const { address } = data;
      resolve(address);
    });
  }),

  placeOrder: (userId, address, payment, wallet) => new Promise((resolve) => {

    Cart.aggregate([
      { $match: { user: userId } },
      { $project: { _id: 0 } },
      { $unwind: '$ProductList' },
      {
        $lookup: {
          from: 'products',
          let: { products: '$ProductList' },
          pipeline: [{
            $match: {
              $expr: {
                $eq: ['$_id', '$$products.ProductId'],
              },
            },
          }],
          as: 'CartList',
        },
      },
      { $unwind: '$CartList' },
    ]).then((data) => {



      userId = mongoose.Types.ObjectId(userId);
      address = mongoose.Types.ObjectId(address);

      UserDb.aggregate([
        { $match: { _id: userId } },
        { $unwind: "$address" },
        { $match: { 'address._id': address } },
        { $project: { address: 1 } }
      ]).then((Address) => {





        let total = 0;
        data.forEach((element) => {
          if (element.CartList.brandOffer > element.CartList.productOffer) {
            total += element.ProductList.COUNT * element.CartList.price - (element.CartList.price / 100 * element.CartList.brandOffer)

          }
          else {
            total += element.ProductList.COUNT * element.CartList.price - (element.CartList.price / 100 * element.CartList.productOffer)
          }



        });


        if (data[0].couponStatus) {
          total = total - data[0].discount
        }

        //this d not worcking so did it twice
        UserDb.findOne({ _id: userId }).then((user) => {

          if (wallet) {
            total = total - user.wallet

            //setting the wallet zero
            UserDb.findOneAndUpdate({ _id: userId }, { $set: { wallet: 0 } })

          }



          let couponStatus = false
          Discount = 0
          total = Math.round(total)
          if (data[0].couponStatus) {
            couponStatus = true
            Discount = data[0].discount
          }

          const order = new Orders({
            userId: userId,
            date: Date.now(),
            orderTotal: total,
            Payment: payment,
            PaymentStatus: "Pending",
            OrderAddress: {
              name: Address[0].address.name,
              place: Address[0].address.place,
              mobile: Address[0].address.mobile,
              city: Address[0].address.city,
              state: Address[0].address.state,
              pin: Address[0].address.pin,
            },
            coupon: couponStatus,
            discount: Discount

          });
          data.forEach((element) => {
            order.product.push({
              productId: element.ProductList.ProductId,
              ProductName: element.CartList.name,
              status: 'Ordered',
              image: element.CartList.image[0],
              count: element.ProductList.COUNT,
              Price: element.CartList.price,
              category: element.CartList.category,

            });

          });

          if (data[0].couponStatus) {

          }

          order.save().then(() => {

            let usd = total / 81
            console.log(usd);
            totalUsd = parseFloat(usd).toFixed(2)
            resolve({ status: true, orderId: order._id, orderTotal: total * 100, USD: totalUsd });

          });
        })
      })

    });
  }),

  getOrdersUser: (userId) => new Promise((resolve) => {
    userId = mongoose.Types.ObjectId(userId);
    Orders.aggregate([
      { $match: { userId } },
      { $sort: { date: -1 } }
    ]).then((orders) => {
      const order = orders;
      resolve({ status: true, order });
    });
  }),

  changeOrderStatus: (orderId, productId) => {
    orderId = mongoose.Types.ObjectId(orderId);
    productId = mongoose.Types.ObjectId(productId);
    return new Promise((resolve) => {
      Orders.findOneAndUpdate(
        { _id: orderId, 'product.productId': productId },
        { $set: { 'product.$.status': 'Canceled' } },
        // use numbers insted of this and it is ec to make changes

      ).then(() => {
        resolve({ status: true });
      });
    });
  },
  returnOrder: (orderId, productId) => {
    orderId = mongoose.Types.ObjectId(orderId);
    productId = mongoose.Types.ObjectId(productId);
    return new Promise((resolve) => {
      Orders.findOneAndUpdate(
        { _id: orderId, 'product.productId': productId },
        { $set: { 'product.$.status': 'Returned' } },
        // use numbers insted of this and it is ec to make changes

      ).then(() => {
        resolve({ status: true });
      });
    });
  },

  clearCart: (userId) => {
    return new Promise((resolve, reject) => {
      Cart.findOneAndRemove({ user: userId }).then((data) => {

        resolve({ status: true, data })
      })
    })
  },

  getSingleOrder: (orderId) => {
    orderId = mongoose.Types.ObjectId(orderId);

    return new Promise((resolve) => {
      Orders.aggregate([
        { $match: { _id: orderId } },
        {
          $project: {
            product: 1, _id: 0, orderTotal: 1, Payment: 1,
          },
        },
        { $unwind: '$product' },
      ]).then((data) => {
        resolve(data);
      });
    });
  },

  deleteAddress: (userId, addressId) => {
    userId = mongoose.Types.ObjectId(userId);
    addressId = mongoose.Types.ObjectId(addressId);
    return new Promise((resolve) => {
      UserDb.findOneAndUpdate(
        { _id: userId },
        { $pull: { address: { _id: addressId } } },
      ).then(() => {
        resolve({ status: true });
      });
    });
  },

  getUserData: (userId) => {
    userId = mongoose.Types.ObjectId(userId);
    return new Promise((resolve) => {
      UserDb.aggregate([
        { $match: { _id: userId } },
      ]).then((data) => {
        resolve(data);
      });
    });
  },

  changePassword: (newPassword, userId) => {
    userId = mongoose.Types.ObjectId(userId);
    return new Promise((resolve) => {
      UserDb.aggregate([{ $match: { _id: userId } }]).then((data) => {

        if (data) {
          bcrypt.hash(newPassword, 10).then((NewPassword) => {
            UserDb.findByIdAndUpdate(userId, { userPassword: NewPassword }).then((data) => {
              if (data) {
                resolve({ status: true });
              }
            });
          });
        }
      });
    });
  },

  addToWishlist: (userId, productId) => {
    productId = mongoose.Types.ObjectId(productId);
    userId = mongoose.Types.ObjectId(userId);
    return new Promise((resolve, reject) => {
      Wishlist.aggregate([{ $match: { user: userId } }]).then((data) => {
        if (data) {
          Wishlist.findOne({ user: userId, ProductList: productId }).then((data) => {

            if (data) {
              Wishlist.findOneAndUpdate({ user: userId }, { $pull: { ProductList: productId } }).then((data) => {
                resolve({ removed: true })
              })
            }
            else {
              Wishlist.findOneAndUpdate({ user: userId }, { $addToSet: { ProductList: productId } }).then((data) => {
                resolve({ added: true })
              })
            }
          })
        }
        else {
          let wish = new Wishlist({
            user: userId,
          })
          wish.ProductList.push(productId)
          wish.save().then((data) => {
          })
        }
      })
    })
  },

  getWishlist: (userId) => {
    userId = mongoose.Types.ObjectId(userId);
    return new Promise((resolve, reject) => {
      Wishlist.aggregate([{ $match: { user: userId } },
      { $unwind: '$ProductList' },
      { $project: { _id: 0, ProductList: 1 } },
      {
        $lookup: {
          from: 'products',
          let: { products: '$ProductList' },
          pipeline: [{
            $match: {
              $expr: {
                $eq: ['$_id', '$$products'],
              },
            },
          }],
          as: 'wishlist',
        }
      },
      { $unwind: '$wishlist' },
      ]).then((data) => {
        resolve({ status: true, data })
      })
    })
  },


  removeFormWishlist: (userId, prodcutId) => {
    return new Promise((resolve, reject) => {
      Wishlist.findOneAndUpdate({ user: userId }, { $pull: { ProductList: prodcutId } }).then((data) => {
        resolve({ status: true })
      })
    })
  },

  addToCartFromWish: function (userId, productId) {
    return new Promise((resolve, reject) => {
      this.addToCart(productId, userId).then(() => {
        Wishlist.findOneAndUpdate({ user: userId }, { $pull: { ProductList: productId } }).then((data) => {
          resolve({ status: true })
        })
      })
    })
  },

  generateRazorPay: (orderId, total) => {

    orderId = orderId.toString()
    return new Promise((resolve, reject) => {
      razorPay.orders.create({
        amount: total,
        currency: "INR",
        receipt: orderId,
        notes: {
          key1: "value3",
          key2: "value2"
        }
      }).then((data) => {
        resolve({ status: true, data })
      })
    })
  },


  verifyRazerPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'fWhQPNs8ySZ4RSY2YEgIMKHn')
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac === details['payment[razorpay_signature]']) {
        resolve({ paymentStatus: true })
      }
      else {
        reject('razorpay error')
      }
    })
  },

  changeOrderPaymentStatus: (orderId, userId) => {
    return new Promise((resolve, reject) => {

      Orders.findOneAndUpdate({ _id: orderId }, { $set: { PaymentStatus: "successful" } }).then(() => {
        Cart.findOneAndRemove({ user: userId }).then((data) => {
          resolve({ status: true })
        });
      })
    })
  },

  generatePaypal: (orderId, total) => {

    orderId = orderId.toString()
    return new Promise((resolve, reject) => {
      const create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": process.env.SUCCESS_URL || "http://localhost:3000/success",
          "cancel_url": process.env.CANCEL_URL ||"http://localhost:3000/cancel"
        },
        "transactions": [{

          "amount": {
            "currency": "USD",
            "total": total
          },
          "description": orderId
        }]
      };
      paypal.payment.create(create_payment_json, function (error, payment) {

        if (error) {
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {

            if (payment.links[i].rel === 'approval_url') {
              resolve(payment.links[i].href)
            }
          }
        }
      });
    })
  },


  updateProfile: (updateDetails, userId) => {
    return new Promise((resolve, reject) => {
      userId = mongoose.Types.ObjectId(userId);
      UserDb.findOneAndUpdate({ _id: userId },
        {
          $set: {
            userName: updateDetails.name,
            userEmail: updateDetails.email,
            userPhone: updateDetails.phone

          }
        }).then((data) => {
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

  gerProductByBrands: (brand) => {
    return new Promise((resolve, reject) => {
      Product.find({ brand: brand }).then((products) => {
        resolve({ status: true, products })
      })
    })
  },

  verifyCoupon: (code, userId) => {
    return new Promise((resolve, reject) => {


      Coupon.findOne({ code: code }).then((coupon) => {
        if (coupon) {
          if (coupon.status) {
            let date = new Date();
            if (date.getTime() <= coupon.Expire.getTime()) {
              Cart.aggregate([
                {
                  $match: {
                    user: userId,
                  },
                },
                { $unwind: ('$ProductList') },
                {
                  $lookup: {
                    from: 'products',
                    let: { products: '$ProductList' },
                    pipeline: [{
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$products.ProductId'],
                        },
                      },
                    }],
                    as: 'CartList',
                  },
                },
                { $unwind: '$CartList' },
              ]).then((data) => {

                const productLIST = data;
                const ITEM = [];
                let SubTotal = 0;
                productLIST.forEach((item) => {
                  if (item.CartList.brandOffer > item.CartList.productOffer) {
                    item.CartList.price = item.CartList.price - (item.CartList.price / 100 * item.CartList.brandOffer)
                  }
                  else {
                    item.CartList.price = item.CartList.price - (item.CartList.price / 100 * item.CartList.productOffer)
                  }
                  item.CartList.count = item.ProductList.COUNT;
                  SubTotal += (item.CartList.count * item.CartList.price);
                  Math.round(SubTotal)
                });
                if (SubTotal >= coupon.minLimit) {

                  let couponOffer = SubTotal / 100 * coupon.discount

                  if (couponOffer > coupon.maxLimit) {
                    couponOffer = coupon.maxLimit
                  }

                  SubTotal = SubTotal - couponOffer

                  resolve({ couponApplied: true, discount: couponOffer, payableAmount: SubTotal, Code: code })

                }
                else {
                  resolve({ noMinPurchase: true })
                }
              });


            }
            else {
              resolve({ dateExpired: true })
            }
          }
          else {
            resolve({ used: true })
          }

        }
        else {
          resolve({ noCoupon: true })
        }
      })
    })

  },

  applyCoupon: (coupon, userId) => {
    userId = mongoose.Types.ObjectId(userId);
    return new Promise((resolve, reject) => {
      Coupon.findOne({ code: coupon.Code }).then((CouponData) => {
        Cart.findOneAndUpdate({ user: userId }, { $set: { discount: coupon.discount, couponStatus: true, couponMin: CouponData.minLimit } }, { upsert: true }).then((data) => {
          if (data) {
            Coupon.findOneAndUpdate({ code: coupon.Code }, { $set: { status: false } }).then(() => {
              resolve({ status: true })
            })
          }

        })
      })

    })
  },

  walletPayment: (orderId, total, userId) => {
    userId = mongoose.Types.ObjectId(userId);
    orderId = mongoose.Types.ObjectId(orderId);
    return new Promise((resolve, reject) => {
      UserDb.findOneAndUpdate({ _id: userId }, { $inc: { wallet: -total } }).then(() => {
        Orders.findOneAndUpdate({ _id: orderId }, { $set: { PaymentStatus: "successful" } }).then(() => {
          resolve(true)
        })
      })
    })
  },

  getAllProducts:()=>{
    return new Promise((resolve, reject) => {
      Product.aggregate([{$match:{}}]).then((products)=>{
        resolve(products)
      })
    })
  },

  filerCategory:(categoryName)=>{
    return new Promise((resolve, reject) => {
      Product.aggregate([
        {$match:{category:categoryName}}
      ]).then((products)=>{
        resolve(products)
      })
    })
  },

  //for search suggestion

  productSearch:(text)=>{
    text=text.trim()  

    return new Promise((resolve, reject) => {
      console.log(text);
      console.log(text.length);
      if (text.length > 0) {
        Product.find({
          name:{$regex:text,$options: 'i'}
        }).then((data)=>{
          resolve(data)
        })
      }
        
    })
  },


};
