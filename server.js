import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import {fileURLToPath} from "url";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import multer from "multer";
import jwt from "jsonwebtoken";
import Listing from "./Listing.js";
import {uploadImage,deleteImage} from "./cloudinary.js";
import {requireAdmin} from "./adminAuth.js";

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();
const PORT=process.env.PORT||3000;

app.use(cors());
app.use(express.json({limit:"2mb"}));
app.use(express.static(__dirname));

const upload=multer({
  storage:multer.memoryStorage(),
  limits:{fileSize:5*1024*1024,files:10},
  fileFilter:(req,file,cb)=>
    file.mimetype.startsWith("image/")
      ? cb(null,true)
      : cb(new Error("Only image files are allowed"))
});

app.get("/health",(req,res)=>res.json({ok:true}));

app.get("/api/listings",async(req,res)=>{
  try{
    res.json(await Listing.find({status:"approved"}).sort({createdAt:-1}));
  }catch{
    res.status(500).json({message:"Could not load listings"});
  }
});

app.post("/api/listings",upload.array("images",10),async(req,res)=>{
  try{
    const {name,price,description,discord}=req.body;
    if(!name||!price||!description||!discord||!req.files?.length){
      return res.status(400).json({message:"Fill every field and choose at least one image"});
    }

    const images=[];
    for(const file of req.files){
      const result=await uploadImage(file.buffer);
      images.push({url:result.secure_url,publicId:result.public_id});
    }

    const item=await Listing.create({
      name,price,description,discord,images,status:"pending"
    });

    res.status(201).json({
      message:"Listing submitted for approval",
      id:item._id
    });
  }catch(error){
    res.status(500).json({message:error.message||"Upload failed"});
  }
});

app.post("/api/admin/login",
  rateLimit({windowMs:15*60*1000,limit:10}),
  async(req,res)=>{
    if(!req.body.password || req.body.password!==process.env.ADMIN_PASSWORD){
      return res.status(401).json({message:"Wrong password"});
    }

    const token=jwt.sign(
      {role:"admin"},
      process.env.JWT_SECRET,
      {expiresIn:"12h"}
    );

    res.json({token});
  }
);

app.get("/api/admin/listings",requireAdmin,async(req,res)=>{
  res.json(await Listing.find().sort({createdAt:-1}));
});

app.patch("/api/admin/listings/:id/approve",requireAdmin,async(req,res)=>{
  const item=await Listing.findByIdAndUpdate(
    req.params.id,{status:"approved"},{new:true}
  );
  if(!item)return res.status(404).json({message:"Not found"});
  res.json(item);
});

app.patch("/api/admin/listings/:id/reject",requireAdmin,async(req,res)=>{
  const item=await Listing.findByIdAndUpdate(
    req.params.id,{status:"rejected"},{new:true}
  );
  if(!item)return res.status(404).json({message:"Not found"});
  res.json(item);
});

app.delete("/api/admin/listings/:id",requireAdmin,async(req,res)=>{
  const item=await Listing.findByIdAndDelete(req.params.id);
  if(!item)return res.status(404).json({message:"Not found"});

  for(const image of item.images||[]){
    try{
      if(image.publicId) await deleteImage(image.publicId);
    }catch{}
  }

  res.json({message:"Deleted"});
});

app.get("/admin",(req,res)=>{
  res.sendFile(path.join(__dirname,"admin.html"));
});

mongoose.connect(process.env.MONGODB_URI)
  .then(()=>app.listen(PORT,()=>console.log("Grand Market running")))
  .catch(error=>{
    console.error(error);
    process.exit(1);
  });