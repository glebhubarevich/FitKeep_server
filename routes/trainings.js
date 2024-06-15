const express = require('express');
const Training = require('../models/training');
const auth = require('../middleware/auth');
const router = new express.Router();
const {isSameDay} = require('date-fns');

// Create a training
router.post('/', auth, async (req, res) => {
	const training = new Training({
		...req.body,
		user: req.user._id,
	});

	try {
		await training.save();
		req.user.trainings = req.user.trainings.concat(training._id);
		await req.user.save();
		res.status(201).send(training);
	} catch (error) {
		res.status(400).send(error);
	}
});

// Get all trainings for the authenticated user
router.get('/', auth, async (req, res) => {
	try {
		const trainings = await Training.find({user: req.user._id}).populate(
			'exercises'
		);
		res.send(trainings);
	} catch (error) {
		console.error(error); // Log error to console
		res.status(500).send(error);
	}
});
// Get a specific training
router.get('/:id', auth, async (req, res) => {
	try {
		const training = await Training.findOne({
			_id: req.params.id,
			user: req.user._id,
		}).populate('exercises');

		if (!training) {
			return res.status(404).send();
		}
		res.send(training);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

//Get all trainings on a specific date
router.get('/date/:date', auth, async (req, res) => {
	try {
		const date = new Date(req.params.date);
		const startOfDay = new Date(date.setHours(0, 0, 0, 0));
		const endOfDay = new Date(date.setHours(23, 59, 59, 999));

		const trainings = await Training.find({
			user: req.user._id,
			date: {
				$gte: startOfDay,
				$lte: endOfDay,
			},
		}).populate('exercises');

		if (!trainings.length) {
			return res
				.status(404)
				.send({message: 'No trainings found on this date'});
		}
		res.send(trainings);
	} catch (error) {
		console.error(error);
		res.status(500).send(error);
	}
});

// Update a training
router.patch('/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['description', 'exercises'];
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({error: 'Invalid updates!'});
	}

	try {
		const training = await Training.findOne({
			_id: req.params.id,
			user: req.user._id,
		});
		if (!training) {
			return res.status(404).send();
		}

		updates.forEach((update) => (training[update] = req.body[update]));

		await training.save();
		res.send(training);
	} catch (error) {
		res.status(400).send(error);
	}
});

// Delete a training
router.delete('/:id', auth, async (req, res) => {
	try {
		const training = await Training.findOneAndDelete({
			_id: req.params.id,
			user: req.user._id,
		});
		if (!training) {
			return res.status(404).send();
		}

		req.user.trainings = req.user.trainings.filter(
			(trainingId) => trainingId.toString() !== req.params.id
		);
		await req.user.save();
		res.send(training);
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
