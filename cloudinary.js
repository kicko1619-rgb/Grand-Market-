import {v2 as cloudinary} from "cloudinary";
import {Readable} from "stream";
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
export function uploadImage(buffer){return new Promise((resolve,reject)=>{const s=cloudinary.uploader.upload_stream({folder:"grand-market/products",resource_type:"image"},(e,r)=>e?reject(e):resolve(r));Readable.from(buffer).pipe(s);});}
export function deleteImage(id){return cloudinary.uploader.destroy(id,{resource_type:"image"});}