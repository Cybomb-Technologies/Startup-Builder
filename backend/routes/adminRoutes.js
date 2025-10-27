const express = require("express");
const { registerAdmin, loginAdmin ,getAllUsers} = require("../controllers/adminController");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.get("/users", getAllUsers); // ✅ New route for registered users

module.exports = router;
