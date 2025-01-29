import { ApiError } from "../utils/ApiErr.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // get the data from frontend
  // validate the data -- check if they are empty
  // check if the user alredy exist if it is throw error
  // hash the password
  // fill the data in the database

  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(409, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(403, "user alredy exist");
  }

  const avtarLocalPath = req.files?.avtar[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avtarPath = await uploadOnCloudinary(avtarLocalPath);
  const coverImagePath = await uploadOnCloudinary(coverImageLocalPath);

  if (!avtarPath) {
    throw new ApiError(409, "Avtar is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avtar: avtarPath.url,
    coverImage: coverImagePath?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(501, "Something went wrong while registering the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user created successfully"));
});

export { registerUser };
