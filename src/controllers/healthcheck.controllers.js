import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  const isServiceDown = false; // Example flag for a failing service

  if (isServiceDown) {
    throw new ApiError(500, "Service is currently unavailable");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { status: "ok" }, "health status is ok"));
});

export { healthcheck };
