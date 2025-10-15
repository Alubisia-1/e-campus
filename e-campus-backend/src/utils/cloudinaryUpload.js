const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');

/**
 * Upload image to Cloudinary with compression
 * @param {Buffer} buffer - Image buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Object} - Cloudinary upload result
 */
const uploadToCloudinary = async (buffer, folder = 'e-campus') => {
  try {
    // Compress image using sharp
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(compressedBuffer);
    });
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
