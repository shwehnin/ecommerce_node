const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require('mongoose');
const router = require('express').Router();
require("dotenv").config();
const authJWT = require("./moddlewares/jwt");
const errorHandler = require("./moddlewares/error_handler");

const app = express();
const env = process.env;
const api = env.API_URL;

const dbUrl = `mongodb://localhost:27017/${env.DBNAME}`;
// mongoose.set('strictQuery', true);

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options("*", cors());
app.use(authJWT());
app.use(errorHandler);

const authRouter = require("./routes/auth_route");

const userRouter = require('./routes/user_route');

const adminRouter = require('./routes/admin_route');

const productRouter = require("./routes/product_route");

app.use(`${api}`,authRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/admin`, adminRouter);

// app.get(`${api}/users`, (req, res, next) => {
//   return res.json([{
//     name: "Hnin",
//     age: 20,
//   }])
// })

app.use('/products', productRouter);

router.use(app);

const hostName = env.HOSTNAME;
const port = env.PORT || 3000;

mongoose.connect(dbUrl, {}).then(() => console.log("Connected to MongoDB!")).catch((err) => console.log(err));
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
