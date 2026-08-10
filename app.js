const grid=document.querySelector("#grid"),statusBox=document.querySelector("#status"),search=document.querySelector("#search"),form=document.querySelector("#form"),msg=document.querySelector("#msg");let items=[];
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const money=x=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR"}).format(x);
function render(){const q=search.value.toLowerCase();const a=items.filter(x=>(x.name+" "+x.description).toLowerCase().includes(q));statusBox.textContent=a.length?`${a.length} listing${a.length===1?"":"s"}`:"No listings found";grid.innerHTML=a.map(x=>`<article class="card"><img src="${esc(x.imageUrl)}" loading="lazy"><div class="body"><h3>${esc(x.name)}</h3><div class="price">${money(x.price)}</div><p class="desc">${esc(x.description)}</p><div class="discord">💬 Discord: ${esc(x.discord)}</div></div></article>`).join("")}
async function load(){try{const r=await fetch("/api/listings");items=await r.json();render()}catch{statusBox.textContent="Could not load listings."}}
search.oninput=render;
form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector("button");b.disabled=true;b.textContent="Uploading...";msg.textContent="";try{const r=await fetch("/api/listings",{method:"POST",body:new FormData(form)});const d=await r.json();if(!r.ok)throw Error(d.message);form.reset();msg.textContent="✓ Submitted for admin approval."}catch(e){msg.textContent="✕ "+e.message}finally{b.disabled=false;b.textContent="Submit for approval"}};
load();
