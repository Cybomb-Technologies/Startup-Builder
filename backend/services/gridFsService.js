const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;

mongoose.connection.once("open", () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "files"
  });
});

module.exports = {
  async getFileStream(fileId) {
    return bucket.openDownloadStream(fileId);
  },

  async replaceFile(fileId, newStream, filename, contentType) {
    // Delete old file
    await bucket.delete(fileId);

    // Upload new file
    const uploadStream = bucket.openUploadStream(filename, {
      contentType
    });

    newStream.pipe(uploadStream);
    
    return new Promise((resolve, reject) => {
      uploadStream.on("finish", () => resolve(uploadStream.id));
      uploadStream.on("error", reject);
    });
  }
};
