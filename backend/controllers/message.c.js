import Conversation from "../models/conversation.m.js";
import Message from "../models/message.m.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
	try {
		const { msg } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newmsg = new Message({
			senderId,
			receiverId,
			msg,
		});

		if (newmsg) {
			conversation.messages.push(newmsge._id);
		}

		await Promise.all([conversation.save(), newmsg.save()]);

		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newmsg);
		}

		res.status(201).json(newmsg);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.msg);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); 

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.msg);
		res.status(500).json({ error: "Internal server error" });
	}
};
