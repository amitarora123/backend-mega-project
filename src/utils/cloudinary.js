import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

function extractPublicId(imageUrl) {
  const parts = imageUrl.split("/upload/");
  if (parts.length > 1) {
    let publicId = parts[1].split(".")[0]; // Remove file extension
    publicId = publicId.replace(/v\d+\//, ""); // Remove version number
    return publicId;
  }
  return null;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);

    return null;
  }
};

const deleteFromCloudinary = async (urlPath) => {
  try {
    const publicId = extractPublicId(urlPath);

    if (!publicId) {
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
