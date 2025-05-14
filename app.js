require('dotenv').config({path:`${process.cwd()}/.env`});
const express = require('express');
const projectRouter = require('./route/projectRoute');
const authRouter = require('./route/authRoute');
const catchAsync = require('./utlis/catchAsync');
const appError = require('./utlis/appError');
const globalErrorHandler = require('./controller/errorController');
const { stack } = require('sequelize/lib/utils');
const app = express();
app.use(express.json());

// all routers will be here

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('*',catchAsync(async (req, res, next) => {
    throw new appError('This route is not defined',404);
})
); 
app.use(globalErrorHandler);
    

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
}
);