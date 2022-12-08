module.exports={
    userAuthentication:(req,res,next)=>{
       
        if (req.session.userlogged) {
            
            next();  
        }
        else{
           
            res.redirect('/login')
        }
    }

}