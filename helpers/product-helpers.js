const Product = require('../model/Product')
const Brand = require("../model/brandModel")

module.exports = {

  addProduct: (ProductDetails, ImageFile) => {
    return new Promise(async (resolve, reject) => {

      let product = new Product({
        name: ProductDetails.productName,
        description: ProductDetails.productDiscription,
        price: ProductDetails.price,
        category: ProductDetails.category,
        regularPrice: ProductDetails.price,
        productOffer:0
      })
      await ImageFile.map(_image)
      function _image(Image) {
        product.image.push(Image.filename)
      }
      await product.save()

      resolve({ productAdded: true })
    })


  },

  getAllProducts: () => {
    return new Promise((resolve, reject) => {

      Product.find({}).then((PRODUCT) => {

        let product = []
        PRODUCT.forEach(element => {
          //if (element.brandOffer>element.productOffer) {

          //}
          if (element.brandOffer > element.productOffer) {
            let offer = (element.price / 100) * element.brandOffer

            element.price = element.price - offer
          }
          else{
            let offer = (element.price / 100) * element.productOffer

            element.price = element.price - offer
          }

          product.push(element)




        });
        console.log(product);
        resolve(product)
      })



    })

  },
  getProduct: (productID) => {
    return new Promise(async (resolve, reject) => {

      let product = await Product.findById(productID)
      resolve(product)

    })

  },



  updateProduct: (productId, productData, img) => {

    return new Promise(async (resolve, reject) => {
      Brand.findOne({ brandName: productData.brand }).then((BRAND) => {

        Product.findByIdAndUpdate(productId, {
          $set: {
            name: productData.productName,
            category: productData.category,
            price: productData.price,
            description: productData.productDiscription,
            brand: productData.brand,
            regularPrice: productData.price,
            brandOffer:BRAND.offer,
            productOffer:productData.productOffer
          }
        }, { upsert: true }).then(async (product) => {

          await img.map(images)

          function images(img) {
            product.image.push(img.filename)
          }
          product.save()

          resolve({ updateStatus: true })
        })

      })
    })
  },


}