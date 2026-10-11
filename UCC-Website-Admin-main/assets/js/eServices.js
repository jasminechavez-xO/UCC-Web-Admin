(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const pageSize = 15;
  let currentPage = 1;
  let editingId = null;
  let logoData = "";
  let nextId = 6;
  let services = [
    {id:1,name:"City of Caloocan",description:"Official website of the City Government of Caloocan.",url:"https://caloocancity.gov.ph/",status:"Active",logo:"",created:1},
    {id:2,name:"Commission on Higher Education",description:"Official higher education information and services.",url:"https://ched.gov.ph/",status:"Active",logo:"",created:2},
    {id:3,name:"AIMS Faculty Portal",description:"Academic Information Management System faculty portal.",url:"",status:"Active",logo:"",created:3},
    {id:4,name:"AIMS Student Portal",description:"Academic Information Management System student portal.",url:"",status:"Active",logo:"",created:4},
    {id:5,name:"Department of Information and Communication Technology",description:"Information and communication technology services and resources.",url:"https://dict.gov.ph/",status:"Active",logo:"",created:5}
  ];
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const icon = (name) => `<i data-lucide="${name}"></i>`;
  const filtered = () => {
    const q = $("serviceSearch").value.trim().toLowerCase();
    const status = $("serviceStatusFilter").value;
    const sort = $("serviceSort").value;
    let result = services.filter(s => (!q || `${s.name} ${s.description} ${s.url}`.toLowerCase().includes(q)) && (status === "all" || s.status === status));
    result.sort((a,b) => sort === "name-desc" ? b.name.localeCompare(a.name) : sort === "newest" ? b.created-a.created : sort === "oldest" ? a.created-b.created : a.name.localeCompare(b.name));
    return result;
  };
  function render() {
    const result = filtered();
    const pages = Math.max(1, Math.ceil(result.length / pageSize));
    currentPage = Math.min(currentPage, pages);
    const slice = result.slice((currentPage-1)*pageSize, currentPage*pageSize);
    $("serviceCount").textContent = `${result.length} ${result.length === 1 ? "service" : "services"}`;
    const tbody = $("servicesTableBody");
    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="services-empty-row">${icon("inbox")}<br><strong>No e-services exist.</strong><br>Use “Add E-Service” to create one.</td></tr>`;
    } else {
      tbody.innerHTML = slice.map(s => `<tr>
        <td><div class="service-name-cell"><div class="service-logo-cell">${s.logo ? `<img src="${s.logo}" alt="">` : icon("globe")}</div><div><strong>${safe(s.name)}</strong><small>E-Service</small></div></div></td>
        <td>${safe(s.description)}</td>
        <td><span class="service-status ${s.status.toLowerCase()}">${safe(s.status)}</span></td>
        <td>${s.url ? `<a class="service-link" href="${safe(s.url)}" target="_blank" rel="noopener noreferrer">Open link ${icon("arrow-up-right")}</a>` : '<span class="muted">No link</span>'}</td>
        <td><div class="service-row-actions">
          <button class="service-action preview-action" type="button" data-action="preview" data-id="${s.id}" title="View details" aria-label="View details">${icon("eye")}</button>
          <button class="service-action edit-action" type="button" data-action="edit" data-id="${s.id}" title="Edit" aria-label="Edit">${icon("pencil")}</button>
          <button class="service-action delete-action" type="button" data-action="delete" data-id="${s.id}" title="Delete" aria-label="Delete">${icon("trash-2")}</button>
        </div></td></tr>`).join("");
    }
    $("servicesPagination").innerHTML = `<button class="services-page-btn" type="button" data-page="${currentPage-1}" aria-label="Previous page" ${currentPage===1?"disabled":""}>${icon("chevron-left")}</button>`+
      Array.from({length:pages},(_,i)=>`<button class="services-page-btn ${i+1===currentPage?"active":""}" type="button" data-page="${i+1}" ${i+1===currentPage?'aria-current="page"':""}>${i+1}</button>`).join("")+
      `<button class="services-page-btn" type="button" data-page="${currentPage+1}" aria-label="Next page" ${currentPage===pages?"disabled":""}>${icon("chevron-right")}</button>`;
    $("servicesEndMessage").hidden = !(result.length > 0 && currentPage === pages);
    if (window.lucide) window.lucide.createIcons();
  }
  function openForm(service=null) {
    editingId = service?.id ?? null; logoData = service?.logo || "";
    $("modalTitle").textContent = service ? "Edit E-Service" : "Add E-Service";
    $("modalSubtitle").textContent = service ? "Update the information for this e-service." : "Enter the information for this e-service.";
    $("serviceName").value = service?.name || "";
    $("serviceDescription").value = service?.description || "";
    $("serviceUrl").value = service?.url || "";
    $("serviceStatus").value = service?.status || "Active";
    $("serviceLogoPreview").src = logoData;
    $("serviceLogoPreview").hidden = !logoData;
    $("logoPreviewContainer").classList.toggle("has-logo", !!logoData);
    $("defaultLogoIcon").hidden = !!logoData;
    $("removeServiceLogo").hidden = !logoData;
    $("serviceLogo").value = "";
    $("serviceModal").classList.add("open"); $("serviceModal").setAttribute("aria-hidden","false");
    if (window.lucide) window.lucide.createIcons();
  }
  function closeForm() { $("serviceModal").classList.remove("open"); $("serviceModal").setAttribute("aria-hidden","true"); }
  function preview(service) {
    const data = service || {name:$("serviceName").value.trim() || "Service Name",description:$("serviceDescription").value.trim() || "Service description will appear here.",url:$("serviceUrl").value.trim(),status:$("serviceStatus").value,logo:logoData};
    $("servicePreviewTitle").textContent = "E-Service Preview";
    $("previewServiceName").textContent = data.name;
    $("previewServiceDescription").textContent = data.description;
    $("previewServiceLogo").src = data.logo || "";
    $("previewServiceLogo").hidden = !data.logo;
    $("previewServiceIcon").classList.toggle("has-logo", !!data.logo);
    $("previewDefaultIcon").hidden = !!data.logo;
    $("previewServiceLink").href = data.url || "#";
    $("previewServiceLink").style.display = data.url ? "inline-flex" : "none";
    const previewModal = $("servicePreviewModal");
    previewModal.classList.add("open");
    previewModal.setAttribute("aria-hidden", "false");
    if (window.lucide) window.lucide.createIcons();
  }
  function closePreview(){
    const previewModal = $("servicePreviewModal");
    previewModal.classList.remove("open");
    previewModal.setAttribute("aria-hidden", "true");
  }
  $("addServiceBtn").addEventListener("click",()=>openForm());
  $("modalClose").addEventListener("click",closeForm);
  $("modalCancel").addEventListener("click",closeForm);
  $("closeServicePreview").addEventListener("click",closePreview);
  $("previewServiceBtn").addEventListener("click",(event)=>{
    event.preventDefault();
    preview({
      name: $("serviceName").value.trim() || "Service Name",
      description: $("serviceDescription").value.trim() || "Service description will appear here.",
      url: $("serviceUrl").value.trim(),
      status: $("serviceStatus").value,
      logo: logoData
    });
  });
  ["serviceSearch","serviceStatusFilter","serviceSort"].forEach(id => $(id).addEventListener(id==="serviceSearch"?"input":"change",()=>{currentPage=1;render();}));
  $("servicesPagination").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(!b||b.disabled)return;currentPage=Number(b.dataset.page);render();});
  $("servicesTableBody").addEventListener("click",e=>{
    const b=e.target.closest("[data-action]"); if(!b)return;
    const service=services.find(s=>s.id===Number(b.dataset.id)); if(!service)return;
    if(b.dataset.action==="preview") { preview(service); }
    if(b.dataset.action==="edit")openForm(service);
    if(b.dataset.action==="delete" && confirm(`Delete "${service.name}"?`)){services=services.filter(s=>s.id!==service.id);render();}
  });
  $("serviceLogo").addEventListener("change",e=>{
    const file=e.target.files?.[0]; if(!file)return;
    if(!file.type.startsWith("image/")){alert("Please choose an image file.");return;}
    const reader=new FileReader(); reader.onload=()=>{logoData=String(reader.result);$("serviceLogoPreview").src=logoData;$("serviceLogoPreview").hidden=false;$("logoPreviewContainer").classList.add("has-logo");$("defaultLogoIcon").hidden=true;$("removeServiceLogo").hidden=false;};reader.readAsDataURL(file);
  });
  $("removeServiceLogo").addEventListener("click",()=>{logoData="";$("serviceLogo").value="";$("serviceLogoPreview").src="";$("serviceLogoPreview").hidden=true;$("logoPreviewContainer").classList.remove("has-logo");$("defaultLogoIcon").hidden=false;$("removeServiceLogo").hidden=true;});
  $("serviceForm").addEventListener("submit",e=>{
    e.preventDefault();
    const data={name:$("serviceName").value.trim(),description:$("serviceDescription").value.trim(),url:$("serviceUrl").value.trim(),status:$("serviceStatus").value,logo:logoData};
    if(!data.name||!data.description){return;}
    if(editingId!==null){services=services.map(s=>s.id===editingId?{...s,...data}:s);}
    else{services.push({id:nextId++,created:Date.now(),...data});}
    currentPage=1;closeForm();render();
  });
  $("servicePreviewModal").addEventListener("click", e => { if (e.target === $("servicePreviewModal")) closePreview(); });
  $("serviceModal").addEventListener("click", e => { if (e.target === $("serviceModal")) closeForm(); });
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeForm();closePreview();}});
  if(window.lucide)window.lucide.createIcons();
  render();
})();