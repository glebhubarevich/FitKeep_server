const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const router = new express.Router();
const dotenv = require('dotenv');
const multer = require('multer');
dotenv.config();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'profileImages/');
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const profileImageUpload = multer({storage: storage});

router.post(
	'/register',
	profileImageUpload.single('profileImage'),
	async (req, res) => {
		console.log(req.body);
		const user = new User({
			...req.body,
			profileImage: req.file
				? `${req.protocol}://${req.get('host')}/${req.file.path}`
				: '',
		});
		try {
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
	}
);
// router.post('/register', async (req, res) => {
// 	try {
// 		const user = new User(req.body);
// 		await user.save();
// 		const token = jwt.sign(
// 			{_id: user._id.toString()},
// 			process.env.JWT_SECRET
// 		);
// 		res.status(201).send({user, token});
// 	} catch (error) {
// 		console.error(error); // Log the error for debugging
// 		res.status(400).send({error: error.message});
// 	}
// });

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
