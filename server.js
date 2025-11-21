const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path: './config/config.env'});

//Connect to database
connectDB();

const app=express();
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter=rateLimit({
windowMs:10*60*1000,//10 mins (fixed option name)
max: 500
});
app.use(limiter);

const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Interview Booking API',
            version: '1.0.0',
            description: 'API for user registration, authentication, company listing and interview session bookings'
        },
        servers:[
            {
                url: 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],

};
const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Enable CORS - allow cross-origin requests
// By default allow all origins. For production, restrict using a whitelist:
// const whitelist = ['https://yourdomain.com'];
// const corsOptions = { origin: (origin, callback) => { if (!origin || whitelist.indexOf(origin) !== -1) callback(null, true); else callback(new Error('Not allowed by CORS')); } };
// app.use(cors(corsOptions));
app.use(cors());

//Cookie parser
app.use(cookieParser());

const auth = require('./routes/auth');
// added routes for the interview booking feature
const companies = require('./routes/companies');
const bookings = require('./routes/bookings');

app.use('/api/v1/auth',auth);
// mount new routes
app.use('/api/v1/companies', companies);
app.use('/api/v1/bookings', bookings);

const PORT=process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise)=> {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=> process.exit(1));
});