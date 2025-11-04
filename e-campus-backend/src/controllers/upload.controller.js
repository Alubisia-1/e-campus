const cloudinary = require('../config/cloudinary');
const { optimizeImage, validateImageDimensions } = require('../utils/imageOptimizer');

/**
 * Upload product images to Cloudinary
 * @route POST /api/upload/product-images
 * @access Private
 */
exports.uploadProductImages = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload at least one image'
      });
    }

    // Validate maximum 3 files
    if (req.files.length > 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 3 images allowed per upload'
      });
    }

    // Use userId if authenticated, otherwise use deviceId from body or generate random ID
    const userId = req.user ? req.user.id : (req.body.deviceId || `anon_${Date.now()}`);
    const timestamp = Date.now();

    // Process all images in parallel for faster upload
    try {
      const uploadedImages = await Promise.all(
        req.files.map(async (file, i) => {
          // Validate image dimensions
          await validateImageDimensions(file.buffer, {
            minWidth: 100,
            minHeight: 100,
            maxWidth: 4000,
            maxHeight: 4000
          });

          // Optimize image
          const optimizedBuffer = await optimizeImage(file.buffer, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 80,
            format: 'webp'
          });

          // Generate unique filename
          const filename = `${userId}_${timestamp}_${i}`;

          // Upload to Cloudinary
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'ecampus/products',
                public_id: filename,
                resource_type: 'auto',
                format: 'webp',
                transformation: [
                  { quality: 'auto:good' },
                  { fetch_format: 'auto' }
                ]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );

            uploadStream.end(optimizedBuffer);
          });

          return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes
          };
        })
      );

      res.status(200).json({
        status: 'success',
        message: `${uploadedImages.length} image(s) uploaded successfully`,
        data: {
          images: uploadedImages
        }
      });

    } catch (imageError) {
      console.error('Error processing images:', imageError);

      // Clean up any successfully uploaded images before the error
      // Note: Since we use Promise.all, if one fails, none complete, but let's be safe
      try {
        const allUploads = await cloudinary.api.resources({
          type: 'upload',
          prefix: `ecampus/products/${userId}_${timestamp}`,
          max_results: 10
        });

        if (allUploads.resources && allUploads.resources.length > 0) {
          await Promise.all(
            allUploads.resources.map(img =>
              cloudinary.uploader.destroy(img.public_id).catch(err =>
                console.error('Cleanup error:', err)
              )
            )
          );
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }

      return res.status(400).json({
        status: 'error',
        message: `Error processing images: ${imageError.message}`
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

/**
 * Delete image from Cloudinary
 * @route DELETE /api/upload/image/:publicId
 * @access Private
 */
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        status: 'error',
        message: 'Public ID is required'
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        status: 'success',
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Image not found or already deleted'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

/**
 * Upload user avatar
 * @route POST /api/upload/avatar
 * @access Private
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload an image'
      });
    }

    const userId = req.user.id;

    // Validate and optimize image
    await validateImageDimensions(req.file.buffer, {
      minWidth: 100,
      minHeight: 100,
      maxWidth: 2000,
      maxHeight: 2000
    });

    const optimizedBuffer = await optimizeImage(req.file.buffer, {
      maxWidth: 500,
      maxHeight: 500,
      quality: 85,
      format: 'webp'
    });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ecampus/avatars',
          public_id: `avatar_${userId}`,
          resource_type: 'auto',
          format: 'webp',
          overwrite: true,
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(optimizedBuffer);
    });

    res.status(200).json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};
