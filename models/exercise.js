const { de } = require('date-fns/locale');
const mongoose = require('mongoose');
const {Schema} = mongoose;
const ExerciseSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	name: {type: String, required: true},
	description: {type: String, required: false},
	category: {
		type: String,
		required: true,
		enum: ['Cardio', 'Biceps', 'Triceps', 'Back', 'Abs', 'Legs', 'Shoulders'],
	},
	media: [{type: String}],
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
