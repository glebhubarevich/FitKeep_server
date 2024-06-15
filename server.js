const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB, {})
	.then(() => {
		console.log('DB connection successful!');
	})
	.catch((err) => {
		console.log(err);
	});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
