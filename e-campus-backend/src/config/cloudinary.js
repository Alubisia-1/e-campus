const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

console.log('Cloudinary Config - Cloud Name:', config.cloud_name);
console.log('Cloudinary Config - API Key:', config.api_key);
console.log('Cloudinary Config - API Secret:', config.api_secret ? '***' + config.api_secret.slice(-4) : 'undefined');

cloudinary.config(config);

module.exports = cloudinary;
