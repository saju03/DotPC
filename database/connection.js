const  mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL||'mongodb://localhost:27017/Byte-cart',{useNewUrlParser:true})


mongoose.connection.once('open',()=>console.log('database connection success')).on('error',error=>{
    console.log(error);
})

