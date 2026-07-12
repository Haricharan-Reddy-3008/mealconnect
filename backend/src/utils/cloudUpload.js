import cloudinary from "../config/cloudinary.js";

export const uploadBufferToCloudinary = async (buffer, filename) => {
  if (!buffer) return null;

  const resource = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mealconnect",
        public_id: filename?.replace(/\.[^/.]+$/, "") || undefined,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(buffer);
  });

  return resource;
};
