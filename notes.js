//todo Packages
// npm i nodemon
// npm init -> (app.js)
// npm i express@4
// npm i morgan -> To see request data in console.

// sudo node app.js -> if you want to listen on port
// nodemon app.js -> to run this code.

//todo Test
// const express = require('express');

// const app = express();

// app.get('/', (req, res) => {
//   res.status(200).send('Hello form server side!');
// });

// const port = 2000;
// app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });


//todo Middlewares : 

    // app.use(express.json());

    // app.use(morgan('dev'));
    
//todo Create user model: 
    

//todo Create routes -> userRoutes.js

    //? in app.js
    // app.use('/api/v1/users', userRouter);

    const express = require('express');
    const userController = require('../controllers/userControllers');

    const router = express.Router();

    router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

    router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

    module.exports = router;

//todo Create controllers -> userController.js

    exports.getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
    };
    exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
    };
    exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
    };
    exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
    };
    exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
    };
    
//todo Creater server.js
    // 1) module.exports = app;
    
    // 2) const app = require('./app');

        const port = 2000;
        app.listen(port, () => {
        console.log(`App running on port ${port}...`);
        });
    
// ENV variables : 
    console.log(app.get('env'));
    console.log(process.env);

    //? 1) Create config.ENV 
            NODE_ENV=development
            PORT=2000
            USERNAME=mohamed
            PASSWORD=m12345 

    //? 2) npm i dotenv
          
    //? 3) put them in server.js 
        const dotenv = require('dotenv');
        dotenv.config({path: './config.env'});
          
    //? 4) put them in app.js    
        if (process.env.NODE_ENV === 'development') {
            app.use(morgan('dev'));
        }
        
    //? 5) put them in server.js
        // const port = process.env.PORT;
        
//todo modify in package.json : 
    // "start": "nodemon server.js", 
    // "start:prod": "NODE_ENV=production nodemon server.js"
    
    // To run them
    // 1) npm start
    // 2) npm run start:prod
    
//todo Setting up ESLint + Prettier in VS Code

    // npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev
  
//todo Connection to Mongoose.compass

    //? Don't forget 
        NODE_ENV=development
        PORT=2000
        DATABASE_USERNAME=Mohamed_Maher
        DATABASE_PASSWORD=awIgzUPJgeKOzIMB

//todo Connection to our Application

    //? Don't forget to change (password -> PASSWORD) and name of database (/name?)
    // DATABASE=mongodb+srv://Mohamed_Maher:<PASSWORD>@cluster0.qymqyus.mongodb.net/Monasba
    
//todo config.env
    NODE_ENV=development
    PORT=2000
    DATABASE=mongodb+srv://Mohamed_Maher:<PASSWORD>@cluster0.qymqyus.mongodb.net/Monasba
    DATABASE_LOCAL=mongodb://localhost:27017/Monasba
    DATABASE_USERNAME=Mohamed_Maher
    DATABASE_PASSWORD=awIgzUPJgeKOzIMB

//todo Install Mongoose : 
    // 1) npm i mongoose@5
    
    // 2) const mongoose = require('mongoose');
    
    // 3)
    //  const DB = process.env.DATABASE.replace(
    //         '<PASSWORD>',
    //         process.env.DATABASE_PASSWORD
    //         );

    //         mongoose
    //         .connect(DB, {
    //             useNewUrlParser: true,
    //             useCreateIndex: true,
    //             useUnifiedTopology: true,
    //             useFindAndModify: false,
    //         })
    //         .then(() => console.log('DB connection successful!'));
            
//todo Test DB connection: 

    const userSchema = new mongoose.Schema({
        name: String,
    });

    const User = mongoose.model('User', userSchema);

    const testUser = new User({
        name: 'Mohamed', 
    });

    testUser.save().then(doc => {
        console.log(doc);
    }).catch(err => {
        console.log('Error :', err);
    })
    

//todo Don't forget this in package.json
    // "engines": {
    //     "node": ">=10.0.0"
    // }
    
//todo Error handling

//todo Create User Model : 

//todo CRUD userController

//todo) Relations :
// 1) User has reviews and items.
// 2) Item has an Owner and reviews.
// 3) Review has an Owner of item and user.

//? userModel
    // a) virtual populate about (items).
    // b) virtual populate about (reviews).
    
//? userController
    // a) populate ['items', 'reviews'].
    
//? itemModel
    // a) virtual populate about (reviews).
    // b) pre-save(Owner), must be found in the model.
    
//? itemController
    // a) populate ['reviews'].
    
//? reviewModel
    // a) pre-save (user).
    // b) pre-save (item).