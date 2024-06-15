const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const router = new express.Router();
const dotenv = require('dotenv');
dotenv.config();

router.post('/register', async (req, res) => {
	try {
		const user = new User(req.body);
		await user.save();
		const token = jwt.sign(
			{_id: user._id.toString()},
			process.env.JWT_SECRET
		);
		res.status(201).send({user, token});
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(400).send({error: error.message});
	}
});

router.post('/login', async (req, res) => {
	console.log(req.body);
	try {
		const user = await User.findOne({email: req.body.email});
		console.log(user);
		if (!user || !(await user.comparePassword(req.body.password))) {
			return res.status(400).send({error: 'Invalid login credentials'});
		}
		const token = jwt.sign(
			{_id: user._id.toString()},
			process.env.JWT_SECRET
		);
		res.send({user, token});
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(400).send({error: error.message});
	}
});

module.exports = router;
