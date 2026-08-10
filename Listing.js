import mongoose from "mongoose";
const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:120},
  price:{type:Number,required:true,min:0},
  description:{type:String,required:true,maxlength:3000},
  discord:{type:String,required:true,trim:true,maxlength:100},
  imageUrl:{type:String,required:true},
  imagePublicId:{type:String,default:""},
  status:{type:String,enum:["pending","approved","rejected"],default:"pending",index:true}
},{timestamps:true});
export default mongoose.model("Listing",schema);
