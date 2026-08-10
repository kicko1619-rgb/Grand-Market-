import {v2 as cloudinary} from "cloudinary";
import {Readable} from "stream";
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});
export function uploadImage(buffer){
  return new Promise((resolve,reject)=>{
    const stream=cloudinary.uploader.upload_stream(
      {folder:"grand-market/products",resource_type:"image"},
      (err,result)=>err?reject(err):resolve(result)
    );
    Readable.from(buffer).pipe(stream);
  });
}
export function deleteImage(id){return cloudinary.uploader.destroy(id,{resource_type:"image"});}
