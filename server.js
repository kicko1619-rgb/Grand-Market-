import "dotenv/config";
import express from "express"; import cors from "cors"; import path from "path"; import {fileURLToPath} from "url";
import mongoose from "mongoose"; import rateLimit from "express-rate-limit"; import multer from "multer"; import jwt from "jsonwebtoken";
import Listing from "./Listing.js"; import {uploadImage,deleteImage} from "./cloudinary.js"; import {requireAdmin} from "./adminAuth.js";
const __filename=fileURLToPath(import.meta.url),__dirname=path.dirname(__filename),app=express(),PORT=process.env.PORT||3000;
app.use(cors()); app.use(express.json({limit:"2mb"})); app.use(express.static(__dirname));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:10},fileFilter:(r,f,c)=>f.mimetype.startsWith("image/")?c(null,true):c(new Error("Only images are allowed"))});
app.get("/health",(r,s)=>s.json({ok:true}));
app.get("/api/listings",async(r,s)=>{try{s.json(await Listing.find({status:"approved"}).sort({createdAt:-1}));}catch{ s.status(500).json({message:"Could not load listings"});}});
app.post("/api/listings",upload.array("images",10),async(r,s)=>{try{
 const {name,price,description,discord}=r.body;
 if(!name||!price||!description||!discord||!r.files?.length)return s.status(400).json({message:"Fill every field and choose at least one image"});
 const images=[]; for(const f of r.files){const x=await uploadImage(f.buffer);images.push({url:x.secure_url,publicId:x.public_id});}
 const item=await Listing.create({name,price,description,discord,images,status:"pending"}); s.status(201).json({message:"Listing submitted for approval",id:item._id});
}catch(e){s.status(500).json({message:e.message||"Upload failed"});}});
app.post("/api/admin/login",rateLimit({windowMs:15*60*1000,limit:10}),async(r,s)=>{if(!r.body.password||r.body.password!==process.env.ADMIN_PASSWORD)return s.status(401).json({message:"Wrong password"});s.json({token:jwt.sign({role:"admin"},process.env.JWT_SECRET,{expiresIn:"12h"})});});
app.get("/api/admin/listings",requireAdmin,async(r,s)=>s.json(await Listing.find().sort({createdAt:-1})));
app.patch("/api/admin/listings/:id/approve",requireAdmin,async(r,s)=>{const x=await Listing.findByIdAndUpdate(r.params.id,{status:"approved"},{new:true});if(!x)return s.status(404).json({message:"Not found"});s.json(x);});
app.patch("/api/admin/listings/:id/reject",requireAdmin,async(r,s)=>{const x=await Listing.findByIdAndUpdate(r.params.id,{status:"rejected"},{new:true});if(!x)return s.status(404).json({message:"Not found"});s.json(x);});
app.delete("/api/admin/listings/:id",requireAdmin,async(r,s)=>{const x=await Listing.findByIdAndDelete(r.params.id);if(!x)return s.status(404).json({message:"Not found"});for(const i of x.images||[]){try{if(i.publicId)await deleteImage(i.publicId)}catch{}}s.json({message:"Deleted"});});
app.get("/admin",(r,s)=>s.sendFile(path.join(__dirname,"admin.html")));
mongoose.connect(process.env.MONGODB_URI).then(()=>app.listen(PORT,()=>console.log("Grand Market running"))).catch(e=>{console.error(e);process.exit(1)});