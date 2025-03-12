const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require('bcrypt');

router.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            ...req.body,
            password: hashedPassword
        });

        const user = await newUser.save();
        res.send('User Registered Successfully');
    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const temp = {
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    _id: user._id
                };
                res.send(temp);
            } else {
                return res.status(400).json({ message: 'Login failed' });
            }
        } else {
            return res.status(400).json({ message: 'Login failed' });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.get("/getallusers", async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: 'Failed to retrieve users', error: error });
    }
});

router.post('/checkemail', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
