const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
	// title: {type: String, required: true},
	description: {type: String},
	date: {type: Date, default: Date.now},
	exercises: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Exercise',
		},
	],
});

module.exports = mongoose.model('Training', TrainingSchema);
