import express from "express";
import ImageKit from "imagekit";
import cors from "cors";
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { clerkClient, requireAuth, getAuth } from '@clerk/express';
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const port = process.env.PORT || 3000;
const app = express();

// IMPORTANT: CORS middleware must be registered before any other middleware or routes
// const allowedOrigins = [
//   "https://piersgpt-server.netlify.app",
//   "https://piersgpt.netlify.app",
//   // Include localhost for development
//   "http://localhost:3000",
//   "http://localhost:5173"
// ];

const allowedOrigins = [ 'http://mygpt-project.online/' ];

// Simple CORS middleware that should work with Netlify
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return next();
});

// After CORS, register other middlewares
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register Clerk middleware
app.use(clerkMiddleware());

// Test Route
app.get("/test", (req, res) => {
  res.send("it works");
});

// Auth route for ImageKit
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get('/auth', (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// Protected route using Clerk
app.get('/protected', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const user = await clerkClient.users.getUser(userId);
  return res.json({ user });
});

// API endpoints
app.post("/api/chats", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { text } = req.body;
  try {
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();

    const userChats = await UserChats.find({ userId: userId });
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [{
          _id: savedChat._id,
          title: text.substring(0, 40),
        }],
      });
      await newUserChats.save();
    } else {
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
    res.status(201).send(newChat._id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat!");
  }
});

app.put("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
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
      { $push: { history: { $each: newItems } } }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding conversation!");
  }
});

app.get("/api/userchats", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const userChats = await UserChats.find({ userId });
    res.status(200).send(userChats[0]?.chats || []);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching userchats!");
  }
});

// Connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

// Start the server
app.listen(port, () => {
  connect();
  console.log(`Server running at http://localhost:${port}`);
});

// Production: Serve static files
app.use(express.static(path.join(__dirname, "../client/dist")));

// Catch-all route for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Ensure CORS headers are present in error responses too
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.status(500).json({ message: "Something went wrong!" });
});
