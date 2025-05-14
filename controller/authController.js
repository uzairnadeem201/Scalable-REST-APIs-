const user = require("../db/models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const catchAsync = require("../utlis/catchAsync");
const AppError = require("../utlis/appError");

const generateToken = (payload) =>{
    return jwt.sign(payload, process.env.JWT_SECRET_KEY,{expiresIn:  process.env.JWT_EXPIRES_IN,});
};
const signup = catchAsync(async(req,res,next) => {
    const body = req.body;
    if(!['1','2'].includes(body.userType)){
        throw new AppError('Invalid user type', 400);
       
    }
    const newUser = await user.create({
        userType: body.userType,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
    });
    const result = newUser.toJSON();
    if(!result){
        return res.status(400).json({
            status: 'fail',
            message: 'User to create the user',
        });
    }
    delete result.password;
    delete result.deletedAt;
    result.token = generateToken({id: result.id});
    
    return res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: result,
    });
});
const login = catchAsync(async (req,res,next)=>{
    const {email , password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide email and password',
        });
    }
    const result = await user.findOne({where: {email}});
    if(!result){
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid email or password',
        });
    }
    const isPasswordMatched = await bcrypt.compareSync(password, result.password);
    if(!isPasswordMatched){
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid email or password',
        });
    }
    const token = generateToken({id: result.id});
    return res.json({
        status: 'success',
        message: 'User logged in successfully',
        data: token,
    });
});
const authentication = catchAsync(async (req,res,next)=>{
    let idToken = '';
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        idToken = req.headers.authorization.split(' ')[1];
    }
    if(!idToken){
        return next(new AppError('Please login to get access',401));
    }
    const tokenDetails = jwt.verify(idToken, process.env.JWT_SECRET_KEY);
    const freshUser = await user.findByPk(tokenDetails.id);
    if(!freshUser){
        return next(new AppError('The user belonging to this token does no longer exist', 400));
    }
    req.user = freshUser;
    return next();
});
const restrictTo = (...userType) => {
    const checkPermission = (req,res,next) => {
        if(!userType.includes(req.user.userType)){
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        return next();
    };
    return checkPermission;
};
module.exports = {signup , login,authentication,restrictTo};