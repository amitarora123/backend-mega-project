import { ApiError } from "../utils/ApiErr.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
      [error]
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get the data from frontend
  // validate the data -- check if they are empty
  // check if the user alredy exist if it is throw error
  // check for image, check for avtar
  // upload them to cloudinary, avtar
  // create user object - create entry in db
  // remove password and refresh token from response
  // check for user creation
  // return res

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

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(422, "user doesn't exist");
  }
  if (!(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use true only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Invalid refresh token ");
  }

  const decodedRefreshToken = await jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedRefreshToken) {
    throw new ApiError(400, "refresh token expired");
  }

  const user = await User.findById(decodedRefreshToken?._id).lean();

  if (!user) {
    throw new ApiError(400, "invalid refresh token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(500, "refresh token expired or used");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    decodedRefreshToken._id
  );

  delete user.password;
  delete user.refreshToken;

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use true only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, user, "new tokens generated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const incomingUser = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword)) {
    throw new ApiError(400, "all fields are required");
  }

  const user = await User.findById(incomingUser._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "password is incorrect");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password updated successfully"));
});

const getCurrentUser = asyncHandler((req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "user found"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName && email)) {
    throw new ApiError(400, "all fields are required");
  }

  const incomingUser = req.user;

  const user = await User.findByIdAndUpdate(
    incomingUser?._id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "error updating user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "fields updated successfully"));
});

const updateUserAvtar = asyncHandler(async (req, res) => {
  const newAvtarLocalPath = req.file.path;

  if (!newAvtarLocalPath) {
    throw new ApiError(400, "Avtar image is required");
  }

  const incomingUser = req.user;

  const urlPath = incomingUser.avtar;
  const isDeleted = await deleteFromCloudinary(urlPath);

  if (!isDeleted) {
    console.log("image could not be deleted");
  }
  const updatedAvtar = await uploadOnCloudinary(newAvtarLocalPath);

  const user = await User.findByIdAndUpdate(
    incomingUser._id,
    { $set: { avtar: updatedAvtar?.url } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avtar updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const newCoverImagePath = req.file.path;

  if (!newCoverImagePath) {
    throw new ApiError(400, "Avtar image is required");
  }

  const incomingUser = req.user;

  const urlPath = incomingUser.coverImage;

  if (urlPath) {
    const isDeleted = await deleteFromCloudinary(urlPath);
    if (!isDeleted) {
      console.log("image could not be deleted");
    }
  }

  const updateCoverImage = await uploadOnCloudinary(newCoverImagePath);

  const user = await User.findByIdAndUpdate(
    incomingUser._id,
    { $set: { coverImage: updateCoverImage?.url } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getUserChannel = asyncHandler(async (req, res) => {
  const incomingChannelUserName = req.params.channel;

  if (!incomingChannelUserName?.trim()) {
    throw new ApiError(400, "channel id is required");
  }

  const incomingUser = req.user;

  const channel = await User.aggregate([
    {
      $match: {
        username: incomingChannelUserName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [incomingUser?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    {
      $project: {
        fullName: 1,
        username: 1,
        subscribedCount: 1,
        isSubscribed: 1,
        avtar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "channel fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvtar,
  updateUserCoverImage,
  getUserChannel,
};
