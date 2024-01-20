import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
var jsonParser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(jsonParser);
import connectMongo from "./config/connection.js";

await connectMongo;

// routes for user
import User from "./src/routes/User.js";
app.use("/api/v1/user", User);

// routes for create
import Post from "./src/routes/Post.js";
app.use("/api/v1/post", Post);

//message
import Message from "./src/routes/Message.js";
app.use("/api/v1/message", Message);

app.listen(process.env.PORT, () =>
  console.log("App is listening on port 8000.")
);
