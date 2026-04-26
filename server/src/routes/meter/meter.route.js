const express = require("express");
const {
  createMotorData,
} = require("../../controllers/meter/createMeter.controller");
const {
  hardwareData,
} = require("../../controllers/meter/hardwareData.controller");

const { verifyUser } = require("../../middlewares/VerifyUser");

const router = express.Router();

router.post("/create", verifyUser, createMotorData);
router.post("/hardware", hardwareData);

module.exports = router;
