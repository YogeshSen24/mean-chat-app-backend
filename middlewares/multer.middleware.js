import multer from 'multer';

// Configure Multer storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// File filter function to accept multiple file types
const fileFilter = (req, file, cb) => {
    // Define allowed MIME types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'application/pdf']; // Add more MIME types as needed

    // Check if the uploaded file's MIME type is in the allowed list
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images, videos, audios, and PDF files are allowed'), false);
    }
};

// Create Multer instance with configuration
const multerUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB max file size
    }
});

export default multerUpload;
