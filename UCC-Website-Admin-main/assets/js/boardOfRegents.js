lucide.createIcons();

/* Sidebar submenu toggle */
document.querySelectorAll(".menu-title").forEach(button => {
    button.addEventListener("click", () => {
        button.parentElement.classList.toggle("open");
    });
});

/* Sample data */
const borMembers = [
    { photo: "BOR-MALAPITAN.jpg", name: 'Hon. Dale Gonzalo "ALONG" R. MALAPITAN', position: "Chairperson, Board of Regents", bio: "Mayor Dale Gonzalo “Along” Malapitan is the Chairman of the Board of Regents of the University of Caloocan City (UCC).", status: "Active", order: 1 },
    { photo: "BOR-NAS.png", name: "Atty. Jessamine Jared S. Nas", position: "Vice Chairman", bio: "Board Member", status: "Active", order: 2 },
    { photo: "BOR-CIEGO.png", name: "EnP. Aurora C. Ciego, DPA", position: "City Administrator", bio: "Board Member", status: "Active", order: 3 },
    { photo: "BOR-CAMINA.png", name: "Atty. Michael Arthur Camina", position: "Member", bio: "Board Member", status: "Active", order: 4 },
    { photo: "BOR-CUNANAN.png", name: "Hon. Carolyn C. Cunanan", position: "Member", bio: "Board Member", status: "Active", order: 5 },
    { photo: "BOR-PRADO.png", name: "Hon. Atty. Patrick L. Prado", position: "Member", bio: "Majority Floor Leader / Caloocan City Council", status: "Active", order: 6 },
    { photo: "BOR-LOPEZ.png", name: "Engr. Wenald H. Lopez, PhD", position: "Member", bio: "Board Member", status: "Active", order: 7 },
    { photo: "BOR-JUNIO.png", name: "Mr. John Nicklaus S. Junio", position: "Member", bio: "Board Member", status: "Active", order: 8 },
    { photo: "BOR-DANTAY.png", name: "Rodrigo M. Dantay Jr., DPA, EdD", position: "Member", bio: "DPA, EdD — Board Member", status: "Active", order: 9 },
    { photo: "BOR-CARANDANG.png", name: "Cecille G. Carandang, CESO VI", position: "Member", bio: "Board Member", status: "Active", order: 10 },
    { photo: "BOR-REYES.png", name: "Dionisio S. Reyes, DPA, LPT", position: "Member", bio: "Board Member", status: "Active", order: 11 },
    { photo: "BOR-MACKAY.png", name: "Dr. Eloisa P. Mackay", position: "Member", bio: "Board Member", status: "Active", order: 12 },
    { photo: "BOR-RABANAL.png", name: "Mr. Paul Daniel C. Rabanal", position: "Member", bio: "Board Member", status: "Active", order: 13 },
    { photo: "BOR-GARCIA.png", name: "Ms. Princess Garcia", position: "Member", bio: "Board Member", status: "Active", order: 14 },
    { photo: "BOR-YAKIT.png", name: "Ms. Leslie Anne C. Yakit", position: "Member", bio: "Board Member", status: "Active", order: 15 },
    { photo: "BOR-GONZALES.png", name: "Ms. Violeta Y. Gonzales", position: "Ex-Officio Member", bio: "Board Member", status: "Active", order: 16 },
    { photo: "BOR-YEE.png", name: "Catlleya C. Yee, PhD-ELL, LPT", position: "Secretary", bio: "Board Member", status: "Active", order: 17 }
];

/* Element references */
const tableBody = document.getElementById("borTableBody");
const searchInput = document.getElementById("borSearch");
const statusFilter = document.getElementById("borStatusFilter");
const resultCount = document.getElementById("borCount");
const emptyState = document.getElementById("borEmpty");
const tableWrap = document.getElementById("borTableWrap");

const modal = document.getElementById("borModal");
const formPreviewModal = document.getElementById("borPreviewModal");
const viewModal = document.getElementById("borViewModal");
const borForm = document.getElementById("borForm");

const photoInput = document.getElementById("borPhoto");
const uploadImage = document.getElementById("borUploadImage");
const uploadInitials = document.getElementById("borUploadInitials");

let editingIndex = null;
let selectedPhoto = "";
let photoObjectUrl = "";

/* Escape HTML before inserting text into markup */
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[char]);
}

function initials(name) {
    return String(name || "BR")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
}

function statusClass(status) {
    return String(status).toLowerCase() === "active"
        ? "active"
        : "hidden-status";
}

function photoUrl(photo) {
    if (!photo) return "";
    if (/^(blob:|data:|https?:\/\/|\/)/i.test(photo)) return photo;
    return `images/${photo}`;
}

function photoMarkup(member) {
    const src = photoUrl(member.photo);
    return `
        <div class="table-photo">
            <span>${escapeHTML(initials(member.name))}</span>
            ${src ? `
                <img src="${escapeHTML(src)}"
                     alt="${escapeHTML(member.name)}"
                     onerror="this.remove()">
            ` : ""}
        </div>
    `;
}

function updateModalScrollLock() {
    document.body.classList.toggle(
        "modal-open",
        !modal.hidden || !formPreviewModal.hidden || !viewModal.hidden
    );
}

function renderBoard() {
    const term = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value.toLowerCase();

    const filtered = borMembers
        .map((member, index) => ({ ...member, index }))
        .filter(member => {
            const searchableText = [
                member.name,
                member.position,
                member.bio,
                member.status
            ].join(" ").toLowerCase();

            return (!term || searchableText.includes(term)) &&
                (selectedStatus === "all" ||
                    member.status.toLowerCase() === selectedStatus);
        })
        .sort((a, b) => Number(a.order) - Number(b.order));

    tableBody.innerHTML = filtered.map(member => `
        <tr>
            <td class="photo-column">${photoMarkup(member)}</td>

            <td class="name-column">
                <div class="name-cell">
                    <strong title="${escapeHTML(member.name)}">
                        ${escapeHTML(member.name)}
                    </strong>
                    <small title="${escapeHTML(member.bio || "")}">
                        ${escapeHTML(member.bio || "—")}
                    </small>
                </div>
            </td>

            <td class="position-column" title="${escapeHTML(member.position)}">
                <span class="ellipsis-text">${escapeHTML(member.position)}</span>
            </td>

            <td class="order-column">${escapeHTML(member.order)}</td>

            <td class="status-column">
                <span class="status-badge ${statusClass(member.status)}">
                    ${escapeHTML(member.status)}
                </span>
            </td>

            <td class="actions-cell">
                <button class="icon-btn view" type="button"
                    title="Preview public result" aria-label="Preview regent"
                    data-action="preview" data-index="${member.index}">
                    <i data-lucide="eye"></i>
                </button>

                <button class="icon-btn edit" type="button"
                    title="Edit regent" aria-label="Edit regent"
                    data-action="edit" data-index="${member.index}">
                    <i data-lucide="pencil"></i>
                </button>

                <button class="icon-btn delete" type="button"
                    title="Delete regent" aria-label="Delete regent"
                    data-action="delete" data-index="${member.index}">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
    `).join("");

    resultCount.textContent =
        `${filtered.length} ${filtered.length === 1 ? "member" : "members"}`;

    emptyState.hidden = filtered.length > 0;
    tableWrap.style.display = filtered.length ? "" : "none";

    lucide.createIcons();
}

function setPhotoPreview(photo, name) {
    const src = photoUrl(photo);
    uploadInitials.textContent = initials(name);

    if (src) {
        uploadImage.src = src;
        uploadImage.style.display = "";
    } else {
        uploadImage.removeAttribute("src");
        uploadImage.style.display = "none";
    }
}

function openBorModal(index = null) {
    editingIndex = index;
    const member = index === null
        ? { photo: "", name: "", position: "", bio: "", status: "Active", order: borMembers.length + 1 }
        : borMembers[index];

    if (!member) return;

    borForm.reset();
    photoInput.value = "";
    selectedPhoto = member.photo || "";

    document.getElementById("borModalTitle").textContent =
        index === null ? "Add Regent" : "Edit Regent";
    document.getElementById("borName").value = member.name || "";
    document.getElementById("borPosition").value = member.position || "";
    document.getElementById("borBio").value = member.bio || "";
    document.getElementById("borStatus").value = member.status || "Active";
    document.getElementById("borOrder").value = member.order || 1;

    setPhotoPreview(selectedPhoto, member.name);
    modal.hidden = false;
    updateModalScrollLock();

    requestAnimationFrame(() => document.getElementById("borName").focus());
}

function closeBorModal() {
    modal.hidden = true;
    updateModalScrollLock();
}

function openBorView(index) {
    const member = borMembers[index];
    if (!member) return;

    document.getElementById("borViewTitle").textContent = member.name;
    document.getElementById("borViewName").textContent = member.name;
    document.getElementById("borViewPosition").textContent =
        member.position || "No position provided";
    document.getElementById("borViewBio").textContent =
        member.bio || "No additional description provided.";
    document.getElementById("borViewOrder").textContent =
        `Display Order: ${member.order}`;

    const status = document.getElementById("borViewStatus");
    status.textContent = member.status;
    status.className = `status-badge ${statusClass(member.status)}`;

    const image = document.getElementById("borViewImage");
    image.alt = member.name;
    image.src = photoUrl(member.photo) || "images/default-avatar.png";
    image.onerror = () => {
        image.removeAttribute("src");
        image.style.display = "none";
    };
    image.style.display = "";

    document.getElementById("borViewInitials").textContent = initials(member.name);

    viewModal.hidden = false;
    updateModalScrollLock();
    lucide.createIcons();
}

function closeBorView() {
    viewModal.hidden = true;
    updateModalScrollLock();
}

function getFormMember() {
    const name = document.getElementById("borName").value.trim();

    return {
        photo: selectedPhoto,
        name,
        position: document.getElementById("borPosition").value.trim(),
        bio: document.getElementById("borBio").value.trim()
            || "No additional description provided.",
        status: document.getElementById("borStatus").value,
        order: Math.max(1, Number(document.getElementById("borOrder").value) || 1)
    };
}

function showFormPreview() {
    // Validate required form fields before showing the preview.
    if (!borForm.reportValidity()) return;

    const member = getFormMember();

    document.getElementById("borPreviewTitle").textContent =
        "Regent Preview";

    document.getElementById("borPreviewName").textContent =
        member.name || "Regent Name";

    document.getElementById("borPreviewPosition").textContent =
        member.position || "No position provided";

    document.getElementById("borPreviewBio").textContent =
        member.bio || "No additional description provided.";

    document.getElementById("borPreviewOrder").textContent =
        `Display Order: ${member.order}`;

    const status = document.getElementById("borPreviewStatus");

    status.textContent = member.status;
    status.className =
        `status-badge ${statusClass(member.status)}`;

    // Update fallback initials.
    document.getElementById("borPreviewInitials").textContent =
        initials(member.name);

    // Update preview image.
    const image = document.getElementById("borPreviewImage");
    const imageContainer = document.getElementById("borPreviewPhoto");
    const imageUrl = photoUrl(member.photo);

    image.onerror = () => {
        image.hidden = true;
        image.removeAttribute("src");
    };

    image.onload = () => {
        image.hidden = false;
    };

    if (imageUrl) {
        image.hidden = false;
        image.src = imageUrl;
    } else {
        image.hidden = true;
        image.removeAttribute("src");
    }

    // Switch to preview while preserving the current form values.
    modal.hidden = true;
    formPreviewModal.hidden = false;

    updateModalScrollLock();
    lucide.createIcons();
}

function saveMember() {
    if (!borForm.reportValidity()) return;

    const member = getFormMember();

    if (editingIndex === null) {
        borMembers.push(member);
    } else if (borMembers[editingIndex]) {
        borMembers[editingIndex] = member;
    } else {
        return;
    }

    modal.hidden = true;
    formPreviewModal.hidden = true;
    editingIndex = null;
    updateModalScrollLock();
    renderBoard();
}

/* Buttons */
document.getElementById("addBorBtn").addEventListener("click", () => openBorModal());
document.getElementById("closeBorModal").addEventListener("click", closeBorModal);
document.getElementById("cancelBorBtn").addEventListener("click", closeBorModal);
document.getElementById("closeBorView").addEventListener("click", closeBorView);

document.getElementById("previewBorFormBtn")
    .addEventListener("click", showFormPreview);

function returnToBorForm() {
    formPreviewModal.hidden = true;
    modal.hidden = false;

    updateModalScrollLock();

    requestAnimationFrame(() => {
        document.getElementById("borName").focus();
    });
}

document.getElementById("closeBorPreview")
    .addEventListener("click", returnToBorForm);

document.getElementById("backToBorForm")
    .addEventListener("click", returnToBorForm);

formPreviewModal.addEventListener("click", event => {
    if (event.target === formPreviewModal) {
        returnToBorForm();
    }
});

document.getElementById("saveFromPreview")
    .addEventListener("click", saveMember);

searchInput.addEventListener("input", renderBoard);
statusFilter.addEventListener("change", renderBoard);

/* Image upload and removal */
photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        photoInput.value = "";
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert("Please choose an image smaller than 10 MB.");
        photoInput.value = "";
        return;
    }

    if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
    photoObjectUrl = URL.createObjectURL(file);
    selectedPhoto = photoObjectUrl;

    const name = document.getElementById("borName").value.trim();
    setPhotoPreview(selectedPhoto, name);
});

document.getElementById("removeBorPhoto").addEventListener("click", () => {
    photoInput.value = "";
    selectedPhoto = "";

    if (photoObjectUrl) {
        URL.revokeObjectURL(photoObjectUrl);
        photoObjectUrl = "";
    }

    setPhotoPreview("", document.getElementById("borName").value.trim());
});

document.getElementById("borName").addEventListener("input", event => {
    uploadInitials.textContent = initials(event.target.value);
});

/* Save from the form */
borForm.addEventListener("submit", event => {
    event.preventDefault();
    saveMember();
});

/* Table actions */
tableBody.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    const member = borMembers[index];
    if (!member) return;

    switch (button.dataset.action) {
        case "preview":
            openBorView(index);
            break;
        case "edit":
            openBorModal(index);
            break;
        case "delete":
            if (confirm(`Delete ${member.name}?`)) {
                borMembers.splice(index, 1);
                if (editingIndex === index) editingIndex = null;
                renderBoard();
            }
            break;
    }
});

/* Close overlays by clicking outside the dialog */
modal.addEventListener("click", event => {
    if (event.target === modal) closeBorModal();
});

formPreviewModal.addEventListener("click", event => {
    if (event.target === formPreviewModal) {
        formPreviewModal.hidden = true;
        modal.hidden = false;
        updateModalScrollLock();
    }
});

viewModal.addEventListener("click", event => {
    if (event.target === viewModal) closeBorView();
});

/* Escape closes the topmost open modal */
document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (!viewModal.hidden) {
        closeBorView();
    } else if (!formPreviewModal.hidden) {
        returnToBorForm();
    } else if (!modal.hidden) {
        closeBorModal();
    }
});

/* Initial render */
renderBoard();