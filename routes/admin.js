const express = require('express');
const router = express.Router();
const store = require('../routes/multer')
const Controller = require('../Controller/admin-Controller');
const authentication = require('../Middlewares/Authenticaton');
const adminController = require('../Controller/admin-Controller');



/* GET users listing. */

router.route('/')
    .get(Controller.getAdminLoginController)
    .post(Controller.postAdminLogin)

router.get('/dashbord', authentication.adminAuthentication, Controller.getDashbordController)

router.get('/view-products', authentication.adminAuthentication, Controller.getViewProductsController)

router.get('/add-products', authentication.adminAuthentication, Controller.getAddProductsController)

router.get('/categories', authentication.adminAuthentication, Controller.getAllCategoriesController)

router.post('/add-products', authentication.adminAuthentication, store.array('images', 4), Controller.postAddProductsController)

router.get('/edit-product/:id', authentication.adminAuthentication, Controller.getEditProductController)

router.get('/edit-product/image/:id/:imageId', authentication.adminAuthentication, adminController.getDeleteProductImage)

router.post('/edit-product/:id', authentication.adminAuthentication, store.array('images', 4), Controller.postEditProductController)

router.post('/add-categories', authentication.adminAuthentication, Controller.postAddCategoriesController)

router.get('/edit-categories/:id', authentication.adminAuthentication, authentication.adminAuthentication, Controller.getEditCategoryController)

router.post('/edit-categories/:id', authentication.adminAuthentication, authentication.adminAuthentication, Controller.postEditCategoryController)

router.get('/logout', authentication.adminAuthentication, Controller.adminLogout)

router.get('/manage-users', authentication.adminAuthentication, Controller.getAllUsers)

router.get('/block/:id', authentication.adminAuthentication, Controller.getBlockUser)

router.get('/unblock/:id', authentication.adminAuthentication, Controller.getUnblockUser)

router.get('/delete-product/:id', authentication.adminAuthentication, Controller.getDeleteProduct)

router.get('/delete-categories/:id', authentication.adminAuthentication, Controller.getDeleteCategory)

router.get('/all-orders', authentication.adminAuthentication, Controller.getAllOrders)

router.post('/edit-order/:orderId/:productId', authentication.adminAuthentication, Controller.updateProductStatus)

router.get('/edit-order/:orderId/:productId', authentication.adminAuthentication, Controller.getOneOrder)

router.get('/sales-report', (req, res) => {
    res.render('admin/sales-date')
})

router.get('/sales-date', adminController.getSalesReport)

router.get('/single-order/:id', adminController.getSingleOrder)

router.get('/banner-management', adminController.getBannerManage)

router.post('/add-banner/', store.array('images', 1), adminController.postBannerManage)


router.delete('/banner-delete', adminController.deleteBanner)


router.get("/brand-management", authentication.adminAuthentication, adminController.getBrandManage)

router.post('/add-brand', authentication.adminAuthentication, store.array('images', 1), adminController.addBrand)


router.delete("/delete-brand/:id", adminController.deleteBrand)

router.get("/add-brand-offer/:id", adminController.getaddBrandOffer)

router.post("/add-brand-offer/:brandId", adminController.postAddBrandOffer)

router.get('/coupon-management', adminController.getCouponManage)

router.post('/add-coupon', adminController.postAddCoupon)

router.delete('/coupon-delete', adminController.deleteCoupon)

router.get('/edit-single-order/:id', adminController.getEditSingleOrder)

router.get('/get-category-sales', adminController.getCategorySales)

router.get('/get-payment-wise-count', adminController.getPaymentReport)
module.exports = router;


