import multer from 'multer';

// Set up memory storage in Multer for direct Cloudinary upload
const storage = multer.memoryStorage();

export const upload = multer({ storage });
