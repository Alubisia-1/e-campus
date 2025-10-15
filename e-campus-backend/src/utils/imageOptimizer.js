const sharp = require('sharp');

/**
 * Compress and optimize image
 * @param {Buffer} buffer - Image buffer from multer
 * @param {Object} options - Optimization options
 * @returns {Buffer} - Optimized image buffer
 */
const optimizeImage = async (buffer, options = {}) => {
  try {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 80,
      format = 'webp'
    } = options;

    // Process image
    const optimized = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toBuffer();

    return optimized;
  } catch (error) {
    throw new Error(`Image optimization failed: ${error.message}`);
  }
};

/**
 * Get image metadata
 * @param {Buffer} buffer - Image buffer
 * @returns {Object} - Image metadata
 */
const getImageMetadata = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size
    };
  } catch (error) {
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
};

/**
 * Validate image dimensions
 * @param {Buffer} buffer - Image buffer
 * @param {Object} limits - Dimension limits
 * @returns {Boolean} - True if valid
 */
const validateImageDimensions = async (buffer, limits = {}) => {
  const { minWidth = 100, minHeight = 100, maxWidth = 4000, maxHeight = 4000 } = limits;

  try {
    const metadata = await getImageMetadata(buffer);

    if (metadata.width < minWidth || metadata.height < minHeight) {
      throw new Error(`Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`);
    }

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      throw new Error(`Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`);
    }

    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  optimizeImage,
  getImageMetadata,
  validateImageDimensions
};
