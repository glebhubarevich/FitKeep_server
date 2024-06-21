const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();
const fs = require('fs');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const Training = require('../models/training');
dotenv.config();
const Exercise = require('../models/exercise');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'profileImages/');
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const profileImageUpload = multer({storage: storage});

router.get('/me', auth, async (req, res) => {
	res.send(req.user);
});

router.patch(
	'/me',
	auth,
	profileImageUpload.single('profileImage'),
	async (req, res) => {
		console.log(req.body);
		const updates = Object.keys(req.body);
		if (req.file) {
			updates.push('profileImage');
		}

		const allowedUpdates = ['name', 'email', 'profileImage'];
		const isValidOperation = updates.every((update) =>
			allowedUpdates.includes(update)
		);

		if (!isValidOperation) {
			return res.status(400).send({error: 'Invalid updates!'});
		}

		try {
			const user = await User.findById(req.user._id);

			if (!user) {
				return res.status(404).send({error: 'User not found'});
			}

			updates.forEach((update) => {
				if (update === 'profileImage') {
					user[update] = `${req.protocol}://${req.get('host')}/${
						req.file.path
					}`;
				} else {
					user[update] = req.body[update];
				}
			});

			await user.save();
			res.send(user);
		} catch (error) {
			console.error(error); // Log the error for debugging
			res.status(400).send({error: error.message});
		}
	}
);
router.patch('/me/password', auth, async (req, res) => {
	const {oldPassword, newPassword} = req.body;

	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).send({error: 'User not found'});
		}

		const isMatch = await user.comparePassword(oldPassword);
		if (!isMatch) {
			return res.status(400).send({error: 'Old password is incorrect'});
		}

		user.password = newPassword;
		await user.save();
		res.send({message: 'Password updated successfully'});
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(400).send({error: error.message});
	}
});
router.delete('/me/profileImage', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).send({error: 'User not found'});
		}

		user.profileImage = `https://api.dicebear.com/8.x/initials/svg?backgroundType=gradientLinear&seed=${user.name.replace(
			/ /g,
			'+'
		)}`;
		await user.save();
		res.send(user);
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).send({error: error.message});
	}
});

router.delete('/me', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).send({error: 'User not found'});
		}

		// Delete all trainings related to the user
		await Training.deleteMany({user: req.user._id});

		// Delete all exercises related to the user
		const exercises = await Exercise.find({user: req.user._id});
		for (const exercise of exercises) {
			// Delete media files associated with each exercise
			for (const mediaPath of exercise.media) {
				const filePath = path.join(__dirname, '..', mediaPath);
				console.log(`Deleting exercise media: ${filePath}`);
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				} else {
					console.log(`File not found: ${filePath}`);
				}
			}
		}
		await Exercise.deleteMany({user: req.user._id});

		if (
			user.profileImage &&
			user.profileImage.startsWith(
				`${req.protocol}://${req.get('host')}/profileImages/`
			)
		) {
			const profileImagePath = path.join(
				__dirname,
				'..',
				user.profileImage.replace(
					`${req.protocol}://${req.get('host')}/`,
					''
				)
			);
			console.log(`Deleting profile image: ${profileImagePath}`);
			if (fs.existsSync(profileImagePath)) {
				fs.unlinkSync(profileImagePath);
			} else {
				console.log(`File not found: ${profileImagePath}`);
			}
		}

		// Delete the user
		await User.findByIdAndDelete(req.user._id);

		res.send({message: 'User and associated data deleted successfully'});
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).send({error: error.message});
	}
});

module.exports = router;
