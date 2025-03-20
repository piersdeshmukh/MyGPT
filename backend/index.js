import express from "express";
import ImageKit from "imagekit";
import cors from "cors";
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import { clerkClient, requireAuth, getAuth } from '@clerk/express'
import Chat from "./models/chat.js"
import UserChats from "./models/userChats.js";
import mongoose from "mongoose";


const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
// app.options('*', cors()); // Enable pre-flight for all routes

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/test",(req,res)=>{
    res.send("it works");
})
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

// allow cross-origin requests
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", 
//     "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.get('/auth', function (req, res) {
  var result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.use(clerkMiddleware())

app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})

// Start the server and listen on the specified port
app.listen(port, () => {
  connect();
  console.log(`Example app listening at http://localhost:${port}`)
})


app.post("/api/chats", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req)
  const { text } = req.body; //how? text came here, bcz was added in body in client's req
  try {
    // CREATE A NEW CHAT
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();
    // CHECK IF THE USERCHATS EXISTS
    const userChats = await UserChats.find({ userId: userId });
    // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });

    const newsaveduserchat = await newUserChats.save();
    } else {
      // IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
      await UserChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
    }
    res.status(201).send(newChat._id); //why send chat id, in on success recieve id
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req)

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });

    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat!");
  }
});

app.put("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req)

  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding conversation!");
  }
});

app.get("/api/userchats", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req)

  try {
    const userChats = await UserChats.find({ userId });
    res.status(200).send(userChats[0]?.chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching userchats!");
  }
});