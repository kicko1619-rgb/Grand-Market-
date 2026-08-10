import jwt from "jsonwebtoken";
export function requireAdmin(req,res,next){
  const h=req.headers.authorization||"";
  const token=h.startsWith("Bearer ")?h.slice(7):null;
  if(!token)return res.status(401).json({message:"Admin login required"});
  try{
    const p=jwt.verify(token,process.env.JWT_SECRET);
    if(p.role!=="admin")throw new Error();
    next();
  }catch{return res.status(401).json({message:"Invalid or expired session"});}
}
