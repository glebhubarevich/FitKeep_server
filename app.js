const express = require('express');
const path = require('path');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const trainingRouter = require('./routes/trainings');
const exerciseRouter = require('./routes/exercises');
const app = express();
const cors = require('cors');
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
	const morgan = require('morgan');
	app.use(morgan('dev'));
}
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
	'/profileImages',
	express.static(path.join(__dirname, 'profileImages'))
);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/trainings', trainingRouter);
app.use('/api/exercises', exerciseRouter);

module.exports = app;
