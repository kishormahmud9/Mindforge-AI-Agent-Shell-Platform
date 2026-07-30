import { OtpService } from "./otp.service.js";
import prisma from "../../prisma/client.js";
import catchAsync from "../../utils/catchAsync.js";

//        SEND OTP   
const sendOtp = catchAsync(async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  await OtpService.sendOtp(prisma, email, name);

  return res.json({
    success: true,
    message: "OTP sent successfully",
    data: null,
  });
});

//     VERIFY OTP      
const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  await OtpService.verifyOtp(prisma, email, otp);

  return res.json({
    success: true,
    message: "OTP verified successfully",
    data: null,
  });
});


export const OtpController = {
  sendOtp,
  verifyOtp,
};
