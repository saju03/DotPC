module.exports={
    adminAuthentication:(req,res,next)=>{
     
        if (req.session.adminLoggedin) {
            
            next();  
        }
        else{
           
            res.redirect('/admin')
        }
    }

}