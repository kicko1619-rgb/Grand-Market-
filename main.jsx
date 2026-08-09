// MULTI-IMAGE VERSION
// Replace your current main.jsx with this file.
// It supports multiple product images and a gallery on the product page.

import React,{useEffect,useMemo,useState} from "react";
import{createRoot}from"react-dom/client";
import"./styles.css";

const KEY="droplist-listings-v2";
const ADMIN_KEY="droplist-admin-demo";
const seed=[];

function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x:seed}catch{return seed}}
const money=value=>{
 const s=String(value??"").trim();
 if(!s)return "₹0";
 // Allow prices such as 1M, 5M, 500K, 1.5M while still formatting plain numbers.
 if(/^[0-9]+(?:\.[0-9]+)?$/.test(s)) return `₹${Number(s).toLocaleString("en-IN")}`;
 return `₹${s}`;
};

function App(){
 const[items,setItems]=useState(load);
 const[page,setPage]=useState("home");
 const[selected,setSelected]=useState(null);
 const[q,setQ]=useState("");
 const[notice,setNotice]=useState("");
 const[successId,setSuccessId]=useState(null);
 const[admin,setAdmin]=useState(localStorage.getItem(ADMIN_KEY)==="1");

 useEffect(()=>{
   try{
     localStorage.setItem(KEY,JSON.stringify(items));
   }catch(err){
     console.error("Storage error (likely image size too large for local storage):",err);
   }
 },[items]);

 const approved=items.filter(x=>x.status==="approved");
 const filtered=useMemo(()=>approved.filter(x=>x.name.toLowerCase().includes(q.toLowerCase())),[approved,q]);

 const open=p=>{setSelected(p);setPage("product");scrollTo(0,0)};

 const submit=e=>{
   e.preventDefault();
   const form=e.currentTarget;
   const d=new FormData(form);
   const files=Array.from(d.getAll("imageFiles")).filter(f=>f&&f.size);
   const imageUrl=d.get("imageUrl");

   const finish=images=>{
     const item={
       id:"DL-"+Math.floor(10000+Math.random()*89999),
       name:d.get("name"),
       price:d.get("price"),
       description:d.get("description")||"No description provided.",
       images:images.length?images:(imageUrl?[imageUrl]:[]),
       discord:d.get("discord"),
       status:"pending",
       createdAt:Date.now()
     };
     setItems(a=>[item,...a]);
     form.reset();
     setSuccessId(item.id);
     setPage("success");
     scrollTo(0,0);
   };

   if(files.length){
     Promise.all(files.map(file=>new Promise(resolve=>{
       const r=new FileReader();
       r.onload=()=>resolve(r.result);
       r.readAsDataURL(file);
     }))).then(finish);
   }else finish([]);
 };

 const contact=id=>{navigator.clipboard?.writeText(id);setNotice(`Discord ID "${id}" copied. Open Discord to contact the seller.`)};
 const logout=()=>{localStorage.removeItem(ADMIN_KEY);setAdmin(false);setPage("home")};

 
 const successStyles = `
 .modern-success{position:relative;min-height:calc(100vh - 180px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;padding:70px 20px}
 .success-background-glow{position:absolute;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,.14),rgba(167,139,250,.08) 45%,transparent 70%);filter:blur(8px);animation:successGlow 3s ease-in-out infinite;pointer-events:none}
 .animated-success-icon{position:relative;width:110px;height:110px;margin-bottom:25px;display:grid;place-items:center}
 .success-circle{position:relative;z-index:2;width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 0 0 8px rgba(34,197,94,.10),0 15px 45px rgba(34,197,94,.30);animation:successPop .65s cubic-bezier(.2,.9,.25,1.4) both}
 .success-check{width:68px;height:68px;margin:12px;overflow:visible}
 .success-check path{stroke-dasharray:50;stroke-dashoffset:50;animation:successDraw .7s .35s ease forwards}
 .success-pulse{position:absolute;inset:10px;border:2px solid rgba(74,222,128,.45);border-radius:50%;animation:successPulse 1.8s ease-out infinite}
 .pulse-2{animation-delay:.7s}
 .modern-success h1{font-size:clamp(42px,7vw,72px);line-height:1.02;margin:10px 0 18px;letter-spacing:-2px}
 .modern-success p{max-width:620px;color:#a7a7b5;line-height:1.7;margin:0 0 28px}
 .modern-success p strong{color:#fff}
 .success-card{position:relative;z-index:1;width:min(620px,100%);display:flex;gap:16px;text-align:left;padding:18px 20px;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.035);backdrop-filter:blur(14px);box-shadow:0 18px 50px rgba(0,0,0,.18);margin-bottom:26px}
 .success-status-icon{width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:rgba(74,222,128,.12);display:grid;place-items:center}
 .success-status-icon span{width:10px;height:10px;border-radius:50%;background:#4ade80;box-shadow:0 0 14px #4ade80;animation:statusBlink 1.5s infinite}
 .success-card div:last-child{display:flex;flex-direction:column;gap:4px}
 .success-card span{font-size:11px;letter-spacing:1.5px;color:#4ade80;font-weight:700}
 .success-card b{font-size:16px;color:#fff}
 .success-card small{color:#8d8d9c;line-height:1.5}
 .success-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
 @keyframes successPop{0%{transform:scale(.25);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
 @keyframes successDraw{to{stroke-dashoffset:0}}
 @keyframes successPulse{0%{transform:scale(.75);opacity:.8}100%{transform:scale(1.45);opacity:0}}
 @keyframes successGlow{0%,100%{transform:scale(.9);opacity:.65}50%{transform:scale(1.12);opacity:1}}
 @keyframes statusBlink{0%,100%{opacity:.45}50%{opacity:1}}
 @media(max-width:600px){.modern-success{padding:45px 16px}.success-card{text-align:left}.modern-success h1{letter-spacing:-1px}}
 @media(prefers-reduced-motion:reduce){.success-circle,.success-check path,.success-pulse,.success-background-glow,.success-status-icon span{animation:none}.success-check path{stroke-dashoffset:0}}
 `;
 return <div><style>{successStyles}</style>
  <header>
   <button className="logo" onClick={()=>setPage("home")}>Grand <span>Market</span></button>
   <nav><button onClick={()=>setPage("home")}>Browse</button><button onClick={()=>setPage("list")}>List Your Item</button>{admin&&<button onClick={()=>setPage("admin")}>Admin</button>}</nav>
   <button className="primary small" onClick={()=>setPage("list")}>+ List Item</button>
  </header>

  {notice&&<div className="notice">{notice}<button onClick={()=>setNotice("")}>×</button></div>}

  {page==="home"&&<><section className="hero"><div><div className="eyebrow">SIMPLE. DIRECT. DISCORD.</div><h1>Find it.<br/><span>Message the seller.</span></h1><p>Browse products and contact sellers directly on Discord. No checkout. No customer accounts.</p><div className="actions"><button className="primary" onClick={()=>document.getElementById("products").scrollIntoView({behavior:"smooth"})}>Browse Items</button><button className="secondary" onClick={()=>setPage("list")}>List Your Item</button></div></div><div className="hero-card"><small>LIVE LISTINGS</small><b>{approved.length}</b><span>approved items</span><i>● Contact sellers on Discord</i></div></section>
  <main id="products" className="container"><div className="head"><div><div className="eyebrow">MARKETPLACE</div><h2>Latest items</h2></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..."/></div><div className="grid">{filtered.map(p=><article className="card" key={p.id} onClick={()=>open(p)}><img src={(p.images&&p.images[0])||p.image} alt=""/><div><h3>{p.name}</h3><strong>{money(p.price)}</strong><span>View →</span></div></article>)}</div></main></>}

  {page==="product"&&selected&&<ProductDetail product={selected} onBack={()=>setPage("home")} onContact={contact}/>}

  {page==="success"&&<main className="container">
    <section className="success-screen modern-success">
      <div className="success-background-glow"></div>
      <div className="animated-success-icon">
        <div className="success-circle">
          <svg viewBox="0 0 52 52" className="success-check">
            <path d="M14 27 L22 35 L39 17" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="success-pulse pulse-1"></div>
        <div className="success-pulse pulse-2"></div>
      </div>
      <span className="eyebrow" style={{color:"#4ade80"}}>LISTING SUBMITTED</span>
      <h1>Item Listed<br/><span style={{color:"#a78bfa"}}>Successfully!</span></h1>
      <p>Your listing <strong>{successId}</strong> has been submitted successfully and is now waiting for admin approval.</p>
      <div className="success-card">
        <div className="success-status-icon"><span></span></div>
        <div>
          <span>STATUS</span>
          <b>Waiting for Admin Approval</b>
          <small>Your item will appear on Grand Market once the admin approves your listing.</small>
        </div>
      </div>
      <div className="success-actions">
        <button className="primary" onClick={()=>{setPage("home");scrollTo(0,0)}}>← Browse Marketplace</button>
        <button className="secondary" onClick={()=>{setPage("list");scrollTo(0,0)}}>List Another Item</button>
      </div>
    </section>
  </main>}

  {page==="list"&&<main className="container form"><div className="eyebrow">SELL SOMETHING</div><h1>List your item.</h1><p>Add multiple product photos. Listings are reviewed by the admin before appearing publicly.</p><form onSubmit={submit}>
   <label>Product name *<input name="name" required/></label>
   <label>Amount *<input name="price" type="text" required/></label>
   <label>Description<textarea name="description" rows="5"/></label>
   <label>Product images<input name="imageFiles" type="file" accept="image/png,image/jpeg,image/webp" multiple/><small className="field-help">You can select multiple images at once.</small></label>
   <label>Or image URL<input name="imageUrl" type="url" placeholder="https://..."/></label>
   <label>Your Discord ID *<input name="discord" required placeholder="username123"/></label>
   <label className="check"><input type="checkbox" required/> I agree to the marketplace rules.</label>
   <button className="primary">Submit Listing</button>
  </form></main>}

  {page==="admin"&&admin&&<main className="container admin"><div className="admin-head"><div><div className="eyebrow">PRIVATE AREA</div><h1>Admin Dashboard</h1></div><button className="secondary" onClick={logout}>Log out</button></div>
   <div className="stats"><div>Pending <b>{items.filter(x=>x.status==="pending").length}</b></div><div>Approved <b>{approved.length}</b></div><div>Rejected <b>{items.filter(x=>x.status==="rejected").length}</b></div></div>
   <div className="admin-list">{items.map(p=><div className="row" key={p.id}><img src={(p.images&&p.images[0])||p.image} alt=""/><section><b>{p.name}</b><span>{money(p.price)} · Discord: {p.discord}</span><small>{p.id} · {p.status} · {(p.images&&p.images.length)||1} image(s)</small></section><div>{p.status==="pending"&&<><button className="approve" onClick={()=>setItems(a=>a.map(x=>x.id===p.id?{...x,status:"approved"}:x))}>Approve</button><button className="reject" onClick={()=>setItems(a=>a.map(x=>x.id===p.id?{...x,status:"rejected"}:x))}>Reject</button></>}<button className="delete" onClick={()=>setItems(a=>a.filter(x=>x.id!==p.id))}>Delete</button></div></div>)}</div>
  </main>}

  {page==="admin-login"&&<AdminLogin onSuccess={()=>{setAdmin(true);setPage("admin")}}/>}

  <footer><b>Grand Market</b><span>Buy and sell. Connect on Discord.</span>{!admin&&<button onClick={()=>setPage("admin-login")}>Admin</button>}</footer>
 </div>
}

function ProductDetail({product,onBack,onContact}){
 const images=product.images?.length?product.images:(product.image?[product.image]:[]);
 const[current,setCurrent]=useState(0);
 const touchStart=React.useRef(null);
 const previous=()=>setCurrent(i=>images.length?((i-1+images.length)%images.length):0);
 const next=()=>setCurrent(i=>images.length?((i+1)%images.length):0);
 const onTouchStart=e=>{touchStart.current=e.touches[0].clientX};
 const onTouchEnd=e=>{if(touchStart.current===null)return;const dx=e.changedTouches[0].clientX-touchStart.current;if(Math.abs(dx)>50){dx<0?next():previous()}touchStart.current=null};
 return <main className="container detail"><button className="back" onClick={onBack}>← Back</button><div className="detail-grid"><section>
  <div className="gallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
   <img className="main-product-image" src={images[current]} alt={product.name}/>
   {images.length>1&&<><button className="gallery-arrow left" aria-label="Previous image" onClick={previous}>‹</button><button className="gallery-arrow right" aria-label="Next image" onClick={next}>›</button><div className="gallery-count">{current+1} / {images.length}</div></>}
  </div>
  {images.length>1&&<div className="thumbs">{images.map((img,i)=><button key={i} className={i===current?"thumb active":"thumb"} onClick={()=>setCurrent(i)}><img src={img} alt={`Image ${i+1}`}/></button>)}</div>}
 </section><section><div className="eyebrow">{product.id}</div><h1>{product.name}</h1><div className="price">{money(product.price)}</div><p>{product.description}</p><button className="primary wide" onClick={()=>onContact(product.discord)}>💬 Contact Seller on Discord</button><small>Discord: {product.discord}</small></section></div></main>
}
function AdminLogin({onSuccess}){
 const[pass,setPass]=useState("");const[err,setErr]=useState("");
 return <main className="container login"><div className="eyebrow">PRIVATE ADMIN</div><h1>Admin login</h1><p>Sign in to manage marketplace listings.</p><form onSubmit={e=>{e.preventDefault();if(pass==="Grand@2026"){localStorage.setItem(ADMIN_KEY,"1");onSuccess()}else setErr("Incorrect password.")}}><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Admin password"/>{err&&<small className="err">{err}</small>}<button className="primary">Enter Dashboard</button></form></main>
}

createRoot(document.getElementById("root")).render(<App/>);
