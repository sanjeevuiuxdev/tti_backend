const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

function uploadBufferToCloudinary(buffer, folder = 'blog-main-images') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = uploadBufferToCloudinary;
