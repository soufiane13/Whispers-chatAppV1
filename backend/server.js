import path from "path";
import express from "express";
import dotenv from "dotenv";


import connectToMongoDB from "./DataBase/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";


dotenv.config();

const __dirname = path.resolve();
// Assign PORT after calling dotenv.config() to access environment variables.
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
	connectToMongoDB();
	console.log(`Server Running on port ${PORT}`);
});