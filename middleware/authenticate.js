const jwt = require('jsonwebtoken')


const authenticate = (req,res,next) => {

    try {
        
        
        let cookieToken = req.cookies.token;
        
        //const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(cookieToken, process.env.SECRET_KEY);
        req.userDate = decode.Date
        req.userId = decode.Id
        req.userName = decode.Name
        
        next()


    }catch(error)
    {
        res.redirect('/login')
    }
    
}

module.exports = authenticate