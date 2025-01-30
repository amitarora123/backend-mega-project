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

    console.log("file is uploaded on cloudinary ", response.url);
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

    console.log(publicId);
    if (!publicId) {
      console.log("Could not extract public id from url");
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    console.log(result);

    if (result.result === "ok") {
      console.log("inside the true condition");
      return true;
    } else {
      console.log("Image could not be deleted", result);
      return false;
    }
  } catch (error) {
    console.log("image could not be deleted from cloudinary", error);
    return false;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
