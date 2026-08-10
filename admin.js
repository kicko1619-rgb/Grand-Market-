let token="";

const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));

async function login(){
  const password=document.querySelector("#password").value;

  const response=await fetch("/api/admin/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({password})
  });

  const data=await response.json();

  if(!response.ok){
    document.querySelector("#msg").textContent=data.message;
    return;
  }

  token=data.token;
  document.querySelector("#login").hidden=true;
  document.querySelector("#dash").hidden=false;
  load();
}

async function load(){
  const response=await fetch("/api/admin/listings",{
    headers:{Authorization:"Bearer "+token}
  });

  const listings=await response.json();

  document.querySelector("#list").innerHTML=listings.map(item=>`
    <article class="item">
      <div class="photos">
        ${(item.images||[]).map(image=>`
          <img src="${esc(image.url)}" alt="${esc(item.name)}">
        `).join("")}
      </div>

      <h3>${esc(item.name)}</h3>
      <b>${esc(item.price)}</b>
      <p>${esc(item.description)}</p>
      <p>Discord: ${esc(item.discord)}</p>
      <p>Status: <b>${esc(item.status)}</b></p>

      <div class="actions">
        ${item.status!=="approved"
          ?`<button class="approve" onclick="act('${item._id}','approve')">✓ Approve</button>`
          :""}
        ${item.status!=="rejected"
          ?`<button class="reject" onclick="act('${item._id}','reject')">Reject</button>`
          :""}
        <button onclick="delItem('${item._id}')">Delete</button>
      </div>
    </article>
  `).join("");
}

async function act(id,action){
  await fetch("/api/admin/listings/"+id+"/"+action,{
    method:"PATCH",
    headers:{Authorization:"Bearer "+token}
  });
  load();
}

async function delItem(id){
  if(!confirm("Delete this listing?"))return;

  await fetch("/api/admin/listings/"+id,{
    method:"DELETE",
    headers:{Authorization:"Bearer "+token}
  });

  load();
}