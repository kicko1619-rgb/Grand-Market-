const form=document.querySelector("#form");
const picker=document.querySelector("#images");
const preview=document.querySelector("#preview");
const msg=document.querySelector("#msg");
const grid=document.querySelector("#grid");
const search=document.querySelector("#search");
const status=document.querySelector("#status");

const viewer=document.querySelector("#viewer");
const viewerImg=document.querySelector("#viewerImg");
const counter=document.querySelector("#counter");

let items=[];
let gallery=[];
let index=0;
let touchStartX=0;

const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

picker.addEventListener("change",()=>{
  preview.innerHTML="";
  msg.textContent="";

  if(picker.files.length>10){
    msg.textContent="Maximum 10 images.";
    picker.value="";
    return;
  }

  [...picker.files].forEach((file,n)=>{
    const image=document.createElement("img");
    image.src=URL.createObjectURL(file);
    image.style.animationDelay=(n*40)+"ms";
    preview.appendChild(image);
  });
});

function render(){
  const q=(search.value||"").toLowerCase();

  const visible=items.filter(item=>
    (item.name+" "+item.description).toLowerCase().includes(q)
  );

  status.textContent=`${visible.length} listing${visible.length===1?"":"s"}`;

  grid.innerHTML=visible.map((item,ix)=>`
    <article class="card" style="animation-delay:${Math.min(ix,10)*45}ms">
      <div class="gallery">
        ${(item.images||[]).map((image,j)=>`
          <img
            src="${esc(image.url)}"
            data-id="${esc(item._id)}"
            data-index="${j}"
            loading="lazy"
            alt="${esc(item.name)}"
          >
        `).join("")}
      </div>
      <div class="body">
        <h3>${esc(item.name)}</h3>
        <div class="price">${esc(item.price)}</div>
        <p class="desc">${esc(item.description)}</p>
        <div class="discord">💬 ${esc(item.discord)}</div>
      </div>
    </article>
  `).join("");
}

grid.addEventListener("click",event=>{
  const image=event.target.closest("img[data-id]");
  if(!image)return;

  const item=items.find(x=>x._id===image.dataset.id);
  if(!item)return;

  gallery=item.images||[];
  index=Number(image.dataset.index)||0;
  openViewer();
});

function openViewer(){
  if(!gallery.length)return;

  viewerImg.src=gallery[index].url;
  counter.textContent=`${index+1} / ${gallery.length}`;

  viewer.classList.add("open");
  viewer.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}

function closeViewer(){
  viewer.classList.remove("open");
  viewer.setAttribute("aria-hidden","true");
  viewerImg.src="";
  document.body.style.overflow="";
}

function moveImage(direction){
  if(!gallery.length)return;

  index=(index+direction+gallery.length)%gallery.length;
  openViewer();
}

document.querySelector("#closeViewer").addEventListener("click",closeViewer);
document.querySelector("#prev").addEventListener("click",()=>moveImage(-1));
document.querySelector("#next").addEventListener("click",()=>moveImage(1));

viewer.addEventListener("click",event=>{
  if(event.target===viewer)closeViewer();
});

document.addEventListener("keydown",event=>{
  if(!viewer.classList.contains("open"))return;

  if(event.key==="Escape")closeViewer();
  if(event.key==="ArrowLeft")moveImage(-1);
  if(event.key==="ArrowRight")moveImage(1);
});

viewer.addEventListener("touchstart",event=>{
  touchStartX=event.changedTouches[0].clientX;
},{passive:true});

viewer.addEventListener("touchend",event=>{
  const dx=event.changedTouches[0].clientX-touchStartX;
  if(Math.abs(dx)>45)moveImage(dx<0?1:-1);
},{passive:true});

search.addEventListener("input",render);

form.addEventListener("submit",async event=>{
  event.preventDefault();

  const button=form.querySelector("button");
  button.disabled=true;
  button.innerHTML="Uploading…";
  msg.textContent="";

  try{
    const response=await fetch("/api/listings",{
      method:"POST",
      body:new FormData(form)
    });

    const data=await response.json();

    if(!response.ok)throw new Error(data.message);

    location.href="/success.html";
  }catch(error){
    msg.textContent="✕ "+error.message;
  }finally{
    button.disabled=false;
    button.innerHTML='Submit for approval <span>→</span>';
  }
});

async function load(){
  try{
    items=await (await fetch("/api/listings")).json();
    render();
  }catch{
    status.textContent="Unable to load listings";
  }
}

load();