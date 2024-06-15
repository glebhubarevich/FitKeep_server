exports.checkNewUser = (req, res, next) => {
	console.log(req.body);
	if (!req.body || !req.body.name || !req.body.email) {
		return res.status(400).json({
			status: 'bad request',
			message: 'Missing name or email field',
		});
	}
	next();
};

exports.getAllUsers = (req, res) => {
	res.status(500).json({
		message: 'Not implemented',
	});
};
exports.createUser = (req, res) => {
	res.status(500).json({
		message: 'Not implemented',
	});
};
exports.getUser = (req, res) => {
	res.status(500).json({
		message: 'Not implemented',
	});
};
exports.updateUser = (req, res) => {
	res.status(500).json({
		message: 'Not implemented',
	});
};
exports.deleteUser = (req, res) => {
	res.status(500).json({
		message: 'Not implemented',
	});
};
