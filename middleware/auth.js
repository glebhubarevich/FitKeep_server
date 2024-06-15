const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config();

const auth = async (req, res, next) => {
	const token = req.header('Authorization')?.replace('Bearer ', '');
	if (!token) {
		return res.status(401).send({error: 'Please authenticate'});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({_id: decoded._id});
		if (!user) {
			throw new Error();
		}
		req.token = token;
		req.user = user;
		next();
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(401).send({error: 'Please authenticate'});
	}
};

module.exports = auth;
