const express = require('express');
const Exercise = require('../models/exercise');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = new express.Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({storage: storage});

// Create an exercise
router.post('/', auth, upload.array('media'), async (req, res) => {
	const exercise = new Exercise({
		...req.body,
		user: req.user._id,
		media: req.files
			? req.files.map(
					(file) => `${req.protocol}://${req.get('host')}/${file.path}`
			  )
			: '',
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
			); 
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
