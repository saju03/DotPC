const multer=require('multer')

var Storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/images')
    },
    filename:function(req,file,cb){
        
        var ext=file.originalname.substring(file.originalname.lastIndexOf('.'))

        cb(null,file.fieldname+'-'+Date.now()+ext)
    }
})
module.exports=store=multer({storage:Storage})