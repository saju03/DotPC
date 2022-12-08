module.exports={
    adminAuthentication:(req,res,next)=>{
        console.log(req.session);
        if (req.session.adminLoggedin) {
            
            next();  
        }
        else{
           
            res.redirect('/admin')
        }
    }

}