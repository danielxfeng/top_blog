import asyncHandler from "express-async-handler";

const userInfoController = asyncHandler(async (req, res) => {});
const userSignupController = asyncHandler(async (req, res) => {});
const userUpdateController = asyncHandler(async (req, res) => {});
const userDeleteController = asyncHandler(async (req, res) => {});
const userLoginController = asyncHandler(async (req, res) => {});
const userLogoutController = asyncHandler(async (req, res) => {});
const userGoogleCallbackController = asyncHandler(async (req, res) => {});

export {
  userInfoController,
  userSignupController,
  userUpdateController,
  userDeleteController,
  userLoginController,
  userLogoutController,
  userGoogleCallbackController,
};
