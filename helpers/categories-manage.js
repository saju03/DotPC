const Category = require('../model/Categories')
module.exports = {

    addCategories: (categoryData) => {
       
        return new Promise(async (resolve, reject) => {
            let categoryName = categoryData.categoryName
            let newcategoryName = categoryName.toUpperCase();


            Category.findOne({catName:newcategoryName}
            
            ).then((data) => {

    
                if (data) {
                
                    resolve({ addStatus: false })
                }
                else {
               
                    let category = new Category({
                        catName: categoryData.categoryName,

                        catSlug: categoryData.categorySlug,
                        catDiscription: categoryData.categorDescription
                    })
                    category.save().then(() => {
                        resolve({ addStatus: true })
                    })
                    
                }

            })

        })
    },

    getAllCategories: () => {
        return new Promise((resolve, reject) => {
            Category.find({}).then((categories) => {
                resolve(categories)
            })

        })

    },
    getCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            let category = await Category.findById(categoryId)
            resolve(category)
        })

    },

    updateCategory: (categoryId, categoryData) => {
        return new Promise(async (resolve, reject) => {
            let category = await Category.findByIdAndUpdate(categoryId, {
                $set: {
                    catName: categoryData.categoryName,
                    catSlug: categoryData.categorySlug,
                    catDiscription: categoryData.categorDescription
                }
            })
            await category.save()
            resolve({ catUpdateStatus: true })
        })

    }


}