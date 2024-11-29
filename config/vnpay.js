require("dotenv").config({ path: "../development/.env" });
module.exports = {
  vnp_TmnCode: process.env.VNP_TMN_CODE || "", // VNPay Terminal Code
  vnp_HashSecret: process.env.VNP_HASH_SECRET || "", // VNPay Hash Secret
  vnp_Url: process.env.VNP_URL || "", // VNPay API URL
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || "", // VNPay Return URL
};
