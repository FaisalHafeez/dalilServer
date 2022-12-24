// Import dependencies or npm packages
const express = require(`express`);
const app = express();
const dotenv = require(`dotenv`).config();
const cookieParser = require(`cookie-parser`);
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

// wrapping reqeust body with cookies parser
app.use(cookieParser());
// wrapping reqeust body with json
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
const Server = async () => {
  try {
    // connecting to the database
    const connection = await mongoose.connect(process.env.uri);
    // mongoose.set("strictQuery", true);
    console.log(`connected to DB`);
    // connecting to port
    app.listen(port, console.log(`Listening to user request`));
    // importing  routes
    const router = require(`./routes/routes`);
    // using imported routes
    app.use(router);
  } catch (error) {
    console.log(error.message);
  }
};

Server();
