// Archivo: libs/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Configura Cloudinary usando el URL completo de la variable de entorno
cloudinary.config(process.env.CLOUDINARY_URL);

export default cloudinary;
