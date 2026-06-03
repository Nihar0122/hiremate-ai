const express = require("express");

const upload = require("../config/multerConfig");

const router = express.Router();

router.post(
  "/upload",
  upload.single("resume"),
  (req, res) => {

    res.json({
      message: "Resume uploaded successfully 🚀",
      file: req.file,
    });

  }
);

module.exports = router;