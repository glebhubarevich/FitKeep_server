const express = require('express');
const Exercise = require('../models/exercise');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = new express.Router();

// Multer configuration for file uploads
const upload = multer({
	dest: 'uploads/',
	limits: {
		fileSize: 10000000, // 10 MB limit
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png|mp4)$/)) {
			return cb(new Error('Please upload an image or video'));
		}
		cb(null, true);
	},
});

// Create an exercise
router.post('/', auth, upload.array('media'), async (req, res) => {
	const exercise = new Exercise({
		...req.body,
		user: req.user._id,
		media: req.files ? req.files.map((file) => file.path) : '', // Save file paths in media field
	});

	try {
		await exercise.save();
		res.status(201).send(exercise);
	} catch (error) {
		res.status(400).send(error);
	}
});

// Get all exercises for the authenticated user
router.get('/', auth, async (req, res) => {
	try {
		const exercises = await Exercise.find({user: req.user._id});
		res.send(exercises);
		console.log(exercises);
	} catch (error) {
		res.status(500).send(error);
	}
});
router.get('/:id', auth, async (req, res) => {
	try {
		const exercise = await Exercise.findById(req.params.id);
		if (!exercise) {
			return res.status(404).send();
		}
		res.send(exercise);
	} catch (error) {
		console.error(error); // Log error to console
		res.status(500).send(error);
	}
});

// Update an exercise
router.patch('/:id', auth, upload.array('media'), async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'category'];
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({error: 'Invalid updates!'});
	}

	try {
		const exercise = await Exercise.findOne({
			_id: req.params.id,
			user: req.user._id,
		});
		if (!exercise) {
			return res.status(404).send();
		}

		updates.forEach((update) => (exercise[update] = req.body[update]));
		if (req.files.length) {
			exercise.media = exercise.media.concat(
				req.files.map((file) => file.path)
			); // Add new files to media array
		}

		await exercise.save();
		res.send(exercise);
	} catch (error) {
		res.status(400).send(error);
	}
});

// Delete an exercise
router.delete('/:id', auth, async (req, res) => {
	try {
		const exercise = await Exercise.findOneAndDelete({
			_id: req.params.id,
			user: req.user._id,
		});
		if (!exercise) {
			return res.status(404).send();
		}
		res.send(exercise);
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
