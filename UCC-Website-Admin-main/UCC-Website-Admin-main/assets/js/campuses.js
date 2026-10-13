(() => {
  const $ = (id) => document.getElementById(id);
  const formModal = $("campusFormModal");
  const previewModal = $("campusPreviewModal");
  const form = $("campusForm");
  const tableBody = $("campusTableBody");
  const search = $("campusSearch");
  let nextId = 3;
  let editingRow = null;
  let currentImage = "";
  let campuses = [
    { id: 1, name: "Main Campus", contact: "(02) 8888-0000", location: "South Campus, Caloocan City", image: "" },
    { id: 2, name: "North Campus", contact: "(02) 8888-0001", location: "North Campus, Caloocan City", image: "" }
  ];

  function mapsUrl(value) {
    const raw = (value || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(raw);
  }
  function safeText(value) { return String(value || "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }
  function imageMarkup(image, alt) {
    return image ? `<img src="${image}" alt="${safeText(alt)}">` : '<i data-lucide="image"></i>';
  }
  function renderRows() {
    const term = search.value.trim().toLowerCase();
    const filtered = campuses.filter(c => [c.name,c.contact,c.location].join(" ").toLowerCase().includes(term));
    tableBody.innerHTML = filtered.map(c => {
      const map = mapsUrl(c.location);
      return `<tr data-campus-row data-id="${c.id}">
        <td><div class="campus-thumb ${c.image ? "" : "campus-no-image"}">${imageMarkup(c.image,c.name)}</div></td>
        <td><strong>${safeText(c.name)}</strong><span class="campus-subtitle">University of Caloocan City</span></td>
        <td>${safeText(c.contact || "—")}</td>
        <td>${map ? `<a class="campus-map-link" href="${safeText(map)}" target="_blank" rel="noopener noreferrer"><i data-lucide="map-pin"></i> View map</a>` : '<span>Not provided</span>'}<small>${safeText(c.location || "")}</small></td>
        <td><div class="campus-row-actions"><button class="campus-icon-btn campus-view" type="button" data-action="preview" aria-label="Preview ${safeText(c.name)}" title="Preview"><i data-lucide="eye"></i></button><button class="campus-icon-btn campus-edit" type="button" data-action="edit" aria-label="Edit ${safeText(c.name)}" title="Edit"><i data-lucide="pencil"></i></button><button class="campus-icon-btn campus-delete" type="button" data-action="delete" aria-label="Delete ${safeText(c.name)}" title="Delete"><i data-lucide="trash-2"></i></button></div></td>
      </tr>`;
    }).join("");
    $("campusCount").textContent = filtered.length;
    $("campusEmptyState").hidden = filtered.length !== 0;
    if (window.lucide) window.lucide.createIcons();
  }
  function setOpen(modal, open) {
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("campus-modal-open", formModal.classList.contains("is-open") || previewModal.classList.contains("is-open"));
  }
  function clearForm() {
    form.reset();
    $("campusId").value = "";
    editingRow = null;
    currentImage = "";
    $("campusImagePreview").innerHTML = '<i data-lucide="image"></i><span>No image selected</span>';
    $("removeCampusImage").hidden = true;
    $("campusFormTitle").textContent = "Add Campus";
    $("saveCampusLabel").textContent = "Save Campus";
    if (window.lucide) window.lucide.createIcons();
  }
  function openForm(campus = null) {
    clearForm();
    if (campus) {
      editingRow = campus.id;
      $("campusId").value = campus.id;
      $("campusName").value = campus.name;
      $("campusContact").value = campus.contact;
      $("campusLocation").value = campus.location;
      currentImage = campus.image || "";
      if (currentImage) {
        $("campusImagePreview").innerHTML = `<img src="${currentImage}" alt="Campus image">`;
        $("removeCampusImage").hidden = false;
      }
      $("campusFormTitle").textContent = "Edit Campus";
      $("saveCampusLabel").textContent = "Save Changes";
    }
    setOpen(formModal, true);
  }
 
function showPreview(campus) {
    const name = campus.name || 'Campus name';

    document.getElementById('campusPreviewName').textContent = name;
    document.getElementById('campusPreviewContact').textContent =
        campus.contact || 'No contact information provided.';
    document.getElementById('campusPreviewLocation').textContent =
        campus.location || 'Not provided';

    const mapUrl = mapsUrl(campus.location);
    const mapLink = document.getElementById('campusPreviewMap');

    mapLink.href = mapUrl || '#';
    mapLink.hidden = !mapUrl;

    const imageContainer = document.getElementById('campusPreviewImage');
    imageContainer.replaceChildren();

    if (campus.image) {
        const img = document.createElement('img');
        img.src = campus.image;
        img.alt = name + ' campus image';

        img.onerror = () => {
            imageContainer.replaceChildren();

            const message = document.createElement('span');
            message.textContent = 'Unable to load campus image';
            imageContainer.appendChild(message);
        };

        imageContainer.appendChild(img);
    } else {
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'image');

        const message = document.createElement('span');
        message.textContent = 'No campus image selected';

        imageContainer.append(icon, message);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    setOpen(document.getElementById('campusPreviewModal'), true);
}


  $("openCampusForm").addEventListener("click", () => openForm());
  document.querySelectorAll("[data-close-form]").forEach(btn => btn.addEventListener("click", () => { setOpen(formModal, false); clearForm(); }));
  document.querySelectorAll("[data-close-preview]").forEach(btn => btn.addEventListener("click", () => setOpen(previewModal, false)));
  [formModal, previewModal].forEach(modal => modal.addEventListener("click", e => { if (e.target === modal) { setOpen(modal, false); if (modal === formModal) clearForm(); } }));
  $("chooseCampusImage").addEventListener("click", () => $("campusImageInput").click());
  
$('campusImageInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please choose a valid image file.');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        if (typeof reader.result !== 'string' || !reader.result) {
            alert('Unable to load the selected image.');
            return;
        }

        currentImage = reader.result;

        const preview = $('campusImagePreview');
        const img = document.createElement('img');

        img.src = currentImage;
        img.alt = 'Campus image preview';

        img.onload = () => {
            preview.hidden = false;
            preview.style.display = 'block';
        };

        img.onerror = () => {
            currentImage = '';
            preview.replaceChildren();
            preview.hidden = true;
            $('removeCampusImage').hidden = true;
            alert('The selected image could not be displayed.');
        };

        preview.replaceChildren(img);
        preview.hidden = false;
        preview.style.display = 'block';
        $('removeCampusImage').hidden = false;
    };

    reader.onerror = () => {
        alert('An error occurred while reading the image.');
    };

    reader.readAsDataURL(file);
});

  $("removeCampusImage").addEventListener("click", () => {
    currentImage = "";
    $("campusImageInput").value = "";
    $("campusImagePreview").innerHTML = '<i data-lucide="image"></i><span>No image selected</span>';
    $("removeCampusImage").hidden = true;
    if (window.lucide) window.lucide.createIcons();
  });
  $("previewCampusBtn").addEventListener("click", () => {
    const name = $("campusName").value.trim();
    if (!name) { $("campusName").focus(); $("campusName").reportValidity(); return; }
    showPreview({ name, contact: $("campusContact").value.trim(), image: currentImage });
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const campus = { id: editingRow || nextId++, name: $("campusName").value.trim(), contact: $("campusContact").value.trim(), location: $("campusLocation").value.trim(), image: currentImage };
    if (editingRow) campuses = campuses.map(c => c.id === editingRow ? campus : c);
    else campuses.push(campus);
    setOpen(formModal, false);
    clearForm();
    renderRows();
  });
  tableBody.addEventListener("click", e => {
    const button = e.target.closest("[data-action]");
    if (!button) return;
    const row = button.closest("tr");
    const campus = campuses.find(c => c.id === Number(row.dataset.id));
    if (!campus) return;
    if (button.dataset.action === "preview") showPreview(campus);
    if (button.dataset.action === "edit") openForm(campus);
    if (button.dataset.action === "delete" && confirm(`Delete "${campus.name}"? This cannot be undone.`)) {
      campuses = campuses.filter(c => c.id !== campus.id);
      renderRows();
    }
  });
  search.addEventListener("input", renderRows);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (previewModal.classList.contains("is-open")) setOpen(previewModal, false);
      else if (formModal.classList.contains("is-open")) { setOpen(formModal, false); clearForm(); }
    }
  });
  if (window.lucide) window.lucide.createIcons();
  renderRows();
})();