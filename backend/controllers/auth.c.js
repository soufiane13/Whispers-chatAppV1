import bcrypt from "bcryptjs";
import User from "../models/user.m.js";
import generateTokenAndSetCookie from "../utils/Token.js";

export const signup = async (req, res) => {
    try {
        const { fullName, username, pwd, confirmpwd, gender } = req.body;

        if (pwd !== confirmpwd) {
            return res.status(400).json({ error: "Passwords don't match" });
        }

        const user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Log the values to debug
        console.log("Password:", pwd);
        console.log("Salt generation...");
        
        // HASH PASSWORD HERE
        const salt = await bcrypt.genSalt(10);
        console.log("Salt:", salt);
        
        const hashedpwd = await bcrypt.hash(pwd, salt);
        console.log("Hashed Password:", hashedpwd);

        // https://avatar-placeholder.iran.liara.run/
        const maleProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femalelProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
            fullName,
            username,
            pwd: hashedpwd,
            gender,
            profilePic: gender === "male" ? maleProfilePic : femalelProfilePic,
        });

        if (newUser) {
            // Generate JWT token here
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", error.msg);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
	try {
		const { username, pwd } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(pwd, user?.pwd || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error in login controller", error.msg);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ msg: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.msg);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
