const productHelpers = require('../helpers/product-helpers');
const categoryHelper = require('../helpers/categories-manage')
const adminHelper = require("../helpers/admin-helpers")
const offerHelper = require('../helpers/offerManage')



module.exports = {
  getEditProductController: (req, res) => {
    let productId = req.params.id
    categoryHelper.getAllCategories().then((category) => {
      productHelpers.getProduct(productId).then((product) => {
        adminHelper.getAllBrands().then((brands)=>{
           res.render('admin/edit-product', { product, category, brands })
        })
       
      })
    })
  },

  getViewProductsController: (req, res) => {
    productHelpers.getAllProducts().then((product) => {
      res.render('admin/view-products', { product })
    })
  },
  getAllCategoriesController: (req, res) => {
    categoryHelper.getAllCategories().then((category) => {
      res.render('admin/categories', { category })
    })
  },

  //this is used for to get the categories for the add product page
  getAddProductsController: (req, res) => {
    categoryHelper.getAllCategories().then((category) => {
      adminHelper.getAllBrands().then((brands)=>{
        res.render('admin/add-products', { category,brands })
      })
      
    })
  },

  postAddProductsController: (req, res) => {
    productHelpers.addProduct(req.body, req.files).then((response) => {
      if (response.productAdded) {
        res.redirect('/admin/view-products')
      }
    })
  },

  postEditProductController: (req, res) => {
    let productId = req.params.id
    productHelpers.updateProduct(productId, req.body, req.files).then((response) => {
      if (response.updateStatus) {
        res.redirect('/admin/view-products')
      }
    })
  },

  postAddCategoriesController: (req, res) => {
  categoryHelper.addCategories(req.body).then((response) => {
      if (response.addStatus) {
        res.json({addStatus:true})
        
      }
      else{
        res.json({addStatus:false})
      }
    })
  },

  getEditCategoryController: (req, res) => {
    categoryHelper.getCategory(req.params.id).then((category) => {
      res.render('admin/edit-categories', { category })
    })
  },
  
  postEditCategoryController: (req, res) => {
    categoryHelper.updateCategory(req.params.id, req.body).then((response) => {
      if (response.catUpdateStatus) {
        res.redirect('/admin/categories')
      }
    })
  },

  getDashbordController: (req, res, next) => {
    adminHelper.getDashbord().then((order)=>{
      categoryHelper.getAllCategories().then((category)=>{
    
         res.render('admin/index',{order,category})
      })
      
    })

   
  },

  getAdminLoginController: (req, res, next) => {

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    if (req.session.adminLoggedin) {
      res.redirect('admin/dashbord')
    }
    else {
      res.render('admin/admin-login')
    }
  },

  postAdminLogin: (req, res) => {
    adminHelper.adminLogin(req.body).then((response) => {
      if (response) {
        req.session.adminLoggedin = true
        res.redirect('/admin/dashbord')
      }
      else {
        req.session.adminLoggedin = false
        res.redirect('/admin')
      }
    })
  },

  getAllUsers: (req, res) => {
    adminHelper.getAllUsers().then((users) => {
      res.render("admin/manage-users", { users })
    })
  },

  adminLogout: (req, res) => {
    req.session.adminLoggedin = false
    res.redirect('/admin')
  },

  getBlockUser: (req, res) => {
    adminHelper.blockUser(req.params.id).then((status) => {
      if (status.blockStatus) {
        res.redirect('/admin/manage-users')
      }
    })
  },

  getUnblockUser: (req, res) => {
    adminHelper.unblockUser(req.params.id).then((status) => {
      if (status.unBlockStatus) {
        res.redirect('/admin/manage-users')
      }
    })
  },

  getDeleteProduct: (req, res) => {
    adminHelper.deleteProduct(req.params.id).then((status) => {
      if (status.deleteStatus) {
        res.send({ url: '/admin/view-products' })
      }
    })
  },

  getDeleteCategory: (req, res) => {
    adminHelper.deleteCategory(req.params.id).then((status) => {
      if (status.deleteStatus) {
        res.send({ url: '/admin/categories' })
      }
    })
  },

  getDeleteProductImage:(req,res)=>{
    adminHelper.deleteOneImage(req.params.id,req.params.imageId).then((response)=>{
        if(response.imgRemoved){
            res.send({status:true})
        }
    })
},

getAllOrders:(req,res)=>{
  adminHelper.getAllOrders().then((allOrders)=>{
  
      res.render("admin/allOrders",{allOrders})
  })

},

updateProductStatus:(req,res)=>{
  adminHelper.changeStatus(req.params.orderId,req.params.productId,req.body.status).then((response)=>{
     
      if (response.status) {
          res.redirect('/admin/all-orders')
      }
      
  })  
 
},

getOneOrder:(req,res)=>{
  adminHelper.getOneOrder(req.params.orderId,req.params.productId).then((response)=>{
     
    res.render('admin/edit-order',{response})
     
  })
 
},

getSalesReport:(req,res)=>{
    
  if (req.query.type==='week') {
     
     adminHelper.getReportByWeek(req.query).then((response)=>{
    
     res.render('admin/sales-report',{response})
     })
  }
  if (req.query.type==='month') {
      adminHelper.getReportByMonth(req.query).then((response)=>{
      
          res.render('admin/sales-report',{response})
      })
  }
  if (req.query.type==='year') {
      adminHelper.getReportByYear(req.query).then((response)=>{
          
          res.render('admin/sales-report',{response})
      })
  }
  
  },

  getSingleOrder:(req,res)=>{
    adminHelper.getSingeleOrder(req.params.id).then((response)=>{
        if(response.status){
            let order = response.data
          
            res.render('admin/single-order',{order})
        }
    })
},

getBannerManage:(req,res)=>{
  adminHelper.getBanners().then((banners)=>{
      res.render('admin/manage-Banners',{banners})
  })
  
}
,

postBannerManage:(req,res)=>{
  adminHelper.addBanner(req.body,req.files[0].filename).then((response)=>{
   if (response) {
       res.redirect('/admin/banner-management')
   }
  })

},

deleteBanner:(req,res)=>{

       
  adminHelper.deleteBanner(req.body.bannerId).then((response)=>{
      
      if (response) {
          res.json({status:true})
      }
  })
},


getBrandManage:(req,res)=>{
  adminHelper.getAllBrands().then((brands)=>{
      if (req.session.brandExist) {
          let err=null
          err=req.session.brandExist
          req.session.brandExist=false
          res.render('admin/brand-manage',{brands,err})
          
      }
      else{
           let err=null
      res.render('admin/brand-manage',{brands,err})
      }
     

  })
 
},
addBrand:(req,res)=>{
      
  adminHelper.addBrand(req.body,req.files[0].filename).then((response)=>{  
      
      if (response.addStatus) {
          res.redirect('/admin/brand-management')
      }
      else{
          req.session.brandExist=true
          res.redirect('/admin/brand-management')
          
      }
  })
},
deleteBrand:(req,res)=>{
  adminHelper.deleteBrand(req.params.id).then((response)=>{
      if (response.status) {
          res.json(true)
      }
  })
},

getaddBrandOffer:(req,res)=>{
  adminHelper.getOneBrand(req.params.id).then((brand)=>{
  res.render('admin/brand-offer',{brand})
  })
},

postAddBrandOffer:(req,res)=>{
  offerHelper.addBrandOffer(req.body.offer,req.params.brandId).then((response)=>{
      if (response) {
          offerHelper.setBrandOffer(req.body.offer,req.params.brandId).then((response)=>{
            res.redirect('/admin/brand-management')
          })
      }
  })

},

getCouponManage:(req,res)=>{
  adminHelper.getAllCoupons().then((coupon)=>{

 
  if(req.session.couponExist){
      let err = req.session.couponExist;
          req.session.couponExist= false;
      res.render('admin/coupon-manage',{err,coupon})
  }else{
      let err=false
      res.render('admin/coupon-manage',{err,coupon})
  }
  })
},
postAddCoupon:(req,res)=>{
  adminHelper.addCoupon(req.body).then((response)=>{
      if(response.status){
          req.session.couponExist=false
          res.redirect('/admin/coupon-management')
      }
      else{ 
          req.session.couponExist=true
    
          res.redirect('/admin/coupon-management')
      }
  })
},

deleteCoupon:(req,res)=>{
 
  adminHelper.deleteCoupon(req.body.code).then((response)=>{
      if(response){
          res.json(true)
      }
  })
},

getEditSingleOrder:(req,res)=>{
  adminHelper.oneOrder(req.params.id).then((order)=>{
      res.render('admin/view-single-order',{order})

  })
  },
  getCategorySales:(req,res)=>{
       
    
    categoryHelper.getAllCategories().then((category)=>{
       adminHelper.categorySalesReport(category).then((response)=>{
        res.json(response)
       })
    })
},

getPaymentReport:(req,res)=>{
  adminHelper.getPaymentReport().then((response)=>{
      res.json(response)
  })
}

}