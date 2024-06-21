const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const app = require('./app');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

const checkUploadsDirectories = () => {
	const profileImageDir = path.join(__dirname, 'profileImages');
	const uploadsDir = path.join(__dirname, 'uploads');
	if (!fs.existsSync(profileImageDir)) {
		fs.mkdirSync(profileImageDir, {recursive: true});
		console.log(`Created directory: ${profileImageDir}`);
	}
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, {recursive: true});
		console.log(`Created directory: ${uploadsDir}`);
	}
};

checkUploadsDirectories();

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
