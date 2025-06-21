const path   = require('path');
const fs     = require('fs');
const multer = require('multer');

const uploadDir = path.resolve(__dirname, '..', 'img');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  }
});

module.exports = multer({ storage });
