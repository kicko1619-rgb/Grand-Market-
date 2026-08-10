import jwt from "jsonwebtoken";

export function requireAdmin(req,res,next){
  try{
    const h=req.headers.authorization||"";
    const token=h.startsWith("Bearer ")?h.slice(7):null;
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    if(payload.role!=="admin") throw new Error();
    next();
  }catch{
    res.status(401).json({message:"Unauthorized"});
  }
}