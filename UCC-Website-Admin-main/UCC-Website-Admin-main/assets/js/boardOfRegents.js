

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

   
    document.querySelectorAll(".menu-title").forEach((button) => {
        button.addEventListener("click", () => {
            button.parentElement.classList.toggle("open");
        });
    });

    

    let regents = [
        ["BOR-MALAPITAN.jpg", "Dale Gonzalo Malapitan", "Chairperson", "Board of Regents"],
        ["BOR-NAS.png", "Atty. Jessamine Jared S. Nas", "University President", "Board of Regents"],
        ["BOR-CIEGO.png", "Regent Ciego", "Member", "Board of Regents"],
        ["BOR-CAMINA.png", "Regent Camina", "Member", "Board of Regents"],
        ["BOR-CUNANAN.png", "Regent Cunanan", "Member", "Board of Regents"],
        ["BOR-PRADO.png", "Regent Prado", "Member", "Board of Regents"],
        ["BOR-LOPEZ.png", "Regent Lopez", "Member", "Board of Regents"],
        ["BOR-JUNIO.png", "Regent Junio", "Member", "Board of Regents"],
        ["BOR-DANTAY.png", "Regent Dantay", "Member", "Board of Regents"],
        ["BOR-CARANDANG.png", "Regent Carandang", "Member", "Board of Regents"],
        ["BOR-REYES.png", "Regent Reyes", "Member", "Board of Regents"],
        ["BOR-MACKAY.png", "Regent Mackay", "Member", "Board of Regents"],
        ["BOR-RABANAL.png", "Regent Rabanal", "Member", "Board of Regents"],
        ["BOR-GARCIA.png", "Regent Garcia", "Member", "Board of Regents"],
        ["BOR-YAKIT.png", "Regent Yakit", "Member", "Board of Regents"],
        ["BOR-GONZALES.png", "Regent Gonzales", "Member", "Board of Regents"],
        ["BOR-YEE.png", "Regent Yee", "Member", "Board of Regents"]
    ].map((item, index) => ({
        id: index + 1, photo: item[0], photoUrl: "", name: item[1], position: item[2],
        bio: item[3] || "", status: "Active", order: index + 1
    }));

    // ELEMENTS
    const $ = (id) => document.getElementById(id);

    const tableBody = $("borTableBody");
    const searchInput = $("borSearch");
    const statusFilter = $("borStatusFilter");
    const orderFilter = $("borOrderFilter");
    const resultCount = $("resultCount");
    const tableRegentCount = $("tableBorCount");
    const pagination = $("borPagination");
    const endMessage = $("borEndMessage");
    const pageSize = 10;
    let currentPage = 1;
    const emptyState = $("borEmpty");
    const tableWrap = $("borTableWrap");

    const modal = $("borModal");
    const previewModal = $("borPreviewModal");
    const viewModal = $("borViewModal");
    const form = $("borForm");

    const photoInput = $("borPhoto");
    const uploadImage = $("borUploadImage");
    const uploadInitials = $("borUploadInitials");
    const removePhotoBtn = $("removeBorPhoto");

    let editingId = null;
    let nextId = regents.length + 1;
    let currentPhotoUrl = "";
    let temporaryPhotoUrl = "";
    let modalReturnFocus = null;

    // GENERAL HELPERS

    function escapeHTML(value = "") {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function getInitials(name = "") {
        const words = name.trim().split(/\s+/).filter(Boolean);

        if (!words.length) return "BR";

        return words.slice(0, 2)
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase();
    }

    function normalizePhotoUrl(photo) {
        if (!photo) return "";

        const value = String(photo).trim();

        if (
            /^(https?:|data:|blob:)/i.test(value) ||
            value.startsWith("/") ||
            value.startsWith("./") ||
            value.startsWith("../")
        ) {
            return value;
        }

        if (value.startsWith("images/")) {
            return `/assets/${value}`;
        }

        if (value.startsWith("assets/")) {
            return value;
        }

        return `/assets/images/${value}`;
    }

    function getPhoto(item) {
        return item.photoUrl || normalizePhotoUrl(item.photo);
    }

    function setImage(element, url, fallbackElement) {
        if (!element) return;

        element.onerror = null;

        if (!url) {
            element.hidden = true;

            if (fallbackElement) {
                fallbackElement.hidden = false;
            }

            return;
        }

        element.onload = () => {
            element.hidden = false;

            if (fallbackElement) {
                fallbackElement.hidden = true;
            }
        };

        element.onerror = () => {
            element.hidden = true;

            if (fallbackElement) {
                fallbackElement.hidden = false;
            }
        };

        element.src = url;
    }

    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function setStatusBadge(element, status) {
        if (!element) return;

        element.textContent = status;

        element.className = "status-badge " +
            (status === "Active" ? "active" : "hidden-status");
    }

    function showModal(element) {
        if (!element) return;

        element.hidden = false;
        document.body.classList.add("modal-open");
        refreshIcons();
    }

    function syncModalState() {
        const anyOpen = [modal, previewModal, viewModal]
            .some((element) => element && !element.hidden);

        document.body.classList.toggle("modal-open", anyOpen);
    }

    function closeModal(element, restoreFocus = false) {
        if (!element) return;

        element.hidden = true;
        syncModalState();

        if (restoreFocus && modalReturnFocus) {
            modalReturnFocus.focus();
        }
    }

    function getFilteredRegents() {
        const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const selectedStatus = statusFilter ? statusFilter.value : "all";

        const filtered = regents
            .filter((item) => {
                const searchable = [
                    item.name,
                    item.position,
                    item.bio,
                    item.status
                ].join(" ").toLowerCase();

                const matchesSearch = searchable.includes(term);
                const matchesStatus =
                    selectedStatus === "all" ||
                    (item.status.toLowerCase() === selectedStatus || (selectedStatus === "hidden" && item.status.toLowerCase() === "inactive"));

                return matchesSearch && matchesStatus;
            });

        const sortMode = orderFilter ? orderFilter.value : "ascending";
        return filtered.sort((a, b) => {
            if (sortMode === "descending") return b.order - a.order || b.id - a.id;
            if (sortMode === "name") return a.name.localeCompare(b.name);
            return a.order - b.order || a.id - b.id;
        });
    }


    // RENDER TABLE

    function renderRegents() {
        if (!tableBody) return;

        const filtered = getFilteredRegents();
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        currentPage = Math.min(currentPage, totalPages);
        const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        tableBody.innerHTML = pageItems.map((item) => {
            const initials = escapeHTML(getInitials(item.name));
            const photo = escapeHTML(getPhoto(item));
            const name = escapeHTML(item.name);
            const position = escapeHTML(item.position);
            const bio = escapeHTML(item.bio || "—");
            const status = escapeHTML(item.status);

            return `
                <tr>
                    <td>
                        <div class="table-photo">
                            <span>${initials}</span>
                            <img
                                src="${photo}"
                                alt="${name}"
                                ${photo ? "" : "hidden"}>
                        </div>
                    </td>

                    <td>
                        <div class="name-cell">
                            <strong>${name}</strong>
                            <small>${bio}</small>
                        </div>
                    </td>

                    <td>${position}</td>

                    <td>${item.order}</td>

                    <td>
                        <span class="status-badge ${
                            item.status === "Active"
                                ? "active"
                                : "hidden-status"
                        }">${status}</span>
                    </td>

                    <td class="actions-cell">
                        <button
                            class="icon-btn view"
                            type="button"
                            title="View details"
                            aria-label="View ${name}"
                            data-action="view"
                            data-id="${item.id}">
                            <i data-lucide="eye"></i>
                        </button>

                        <button
                            class="icon-btn edit"
                            type="button"
                            title="Edit regent"
                            aria-label="Edit ${name}"
                            data-action="edit"
                            data-id="${item.id}">
                            <i data-lucide="pencil"></i>
                        </button>

                        <button
                            class="icon-btn delete"
                            type="button"
                            title="Delete regent"
                            aria-label="Delete ${name}"
                            data-action="delete"
                            data-id="${item.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        // Handle table photo errors without inline JavaScript.
        tableBody.querySelectorAll(".table-photo img").forEach((img) => {
            img.addEventListener("error", () => {
                img.hidden = true;
            }, { once: true });

            img.addEventListener("load", () => {
                img.hidden = false;
            }, { once: true });
        });

        const countText = `${filtered.length} ${filtered.length === 1 ? "regent" : "regents"}`;
        if (resultCount) resultCount.textContent = countText;
        if (tableRegentCount) tableRegentCount.textContent = countText;
        renderRegentsPagination(totalPages, filtered.length);

        if (emptyState) {
            emptyState.hidden = filtered.length > 0;
        }

        if (tableWrap) {
            tableWrap.hidden = filtered.length === 0;
        } else if (tableBody.parentElement) {
            tableBody.parentElement.style.display =
                filtered.length ? "" : "none";
        }

        refreshIcons();
    }

    function renderRegentsPagination(totalPages, totalItems) {
        if (!pagination) return;
        pagination.replaceChildren();
        pagination.hidden = false;
        const addButton = (label, page, options = {}) => {
            const button = document.createElement("button");
            button.type = "button";
            if (options.icon) {
                const icon = document.createElement("i");
                icon.setAttribute("data-lucide", options.icon);
                icon.setAttribute("aria-hidden", "true");
                button.appendChild(icon);
                button.setAttribute("aria-label", options.label || label);
            } else button.textContent = label;
            button.disabled = Boolean(options.disabled);
            if (options.active) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }
            button.addEventListener("click", () => { currentPage = page; renderRegents(); });
            pagination.appendChild(button);
        };
        addButton("", Math.max(1, currentPage - 1), { disabled: currentPage === 1, icon: "chevron-left", label: "Previous page" });
        for (let page = 1; page <= totalPages; page++) addButton(String(page), page, { active: page === currentPage });
        addButton("", Math.min(totalPages, currentPage + 1), { disabled: currentPage === totalPages, icon: "chevron-right", label: "Next page" });
        if (endMessage) endMessage.hidden = totalItems === 0 || currentPage !== totalPages;
        refreshIcons();
    }

    // FORM AND PHOTO PREVIEW

    function updateFormPhotoPreview(url, name) {
        const uploadLabel = document.querySelector('label[for="regentPhoto"]');
        if (uploadLabel) {
            uploadLabel.innerHTML = `<i data-lucide="upload"></i> Choose Photo`;
        }
        if (removePhotoBtn) removePhotoBtn.hidden = !url;
        if (uploadInitials) {
            uploadInitials.textContent = getInitials(name || "Board Regent");
            uploadInitials.hidden = Boolean(url);
        }

        if (uploadImage) {
            setImage(uploadImage, url, uploadInitials);
        }
        refreshIcons();
    }

    function clearTemporaryPhoto() {
        if (temporaryPhotoUrl) {
            URL.revokeObjectURL(temporaryPhotoUrl);
            temporaryPhotoUrl = "";
        }
    }

    function openRegentModal(id = null) {
        if (!form || !modal) return;

        clearTemporaryPhoto();

        editingId = id;
        modalReturnFocus = document.activeElement;

        const item = id === null
            ? {
                photo: "",
                photoUrl: "",
                name: "",
                position: "",
                bio: "",
                status: "Active",
                order: regents.length + 1
            }
            : regents.find((regent) => regent.id === id);

        if (!item) return;

        form.reset();

        $("borModalTitle").textContent =
            id === null ? "Add Regent" : "Edit Regent";

        $("borName").value = item.name;
        $("borPosition").value = item.position;
        $("borBio").value = item.bio;
        $("borOrder").value = item.order;
        $("borStatus").value = item.status;
        currentPhotoUrl = item.photoUrl || "";
        const photo = getPhoto(item);

        if (photoInput) {
            photoInput.value = "";
        }

        updateFormPhotoPreview(photo, item.name);

        showModal(modal);

        if ($("borName")) {
            $("borName").focus();
        }
    }

    function closeRegentModal() {
        closeModal(modal, true);
        clearTemporaryPhoto();
    }

    function readForm() {
        const name = $("borName").value.trim();
        const position = $("borPosition").value.trim();
        const bio = $("borBio").value.trim();
        const status = $("borStatus").value;
        const order = Number($("borOrder").value);

        if (!name || !position) {
            form.reportValidity();
            return null;
        }

        if (!Number.isInteger(order) || order < 1) {
            $("borOrder").setCustomValidity(
                "Display order must be a whole number greater than zero."
            );
            $("borOrder").reportValidity();
            $("borOrder").setCustomValidity("");
            return null;
        }

        const previous = editingId === null
            ? null
            : regents.find((item) => item.id === editingId);

        return {
            id: editingId === null ? nextId : editingId,
            photo: previous ? previous.photo : "",
            photoUrl: currentPhotoUrl,
            name,
            position,
            bio,
            status,
            order
        };
    }

    function saveRegent() {
        if (!form.reportValidity()) return;

        const item = readForm();

        if (!item) return;

        if (editingId === null) {
            regents.push(item);
            nextId += 1;
        } else {
            const index = regents.findIndex(
                (regent) => regent.id === editingId
            );

            if (index === -1) return;

            regents[index] = item;
        }

        clearTemporaryPhoto();

        closeModal(modal);
        closeModal(previewModal);

        editingId = null;
        currentPhotoUrl = "";

        renderRegents();
        syncModalState();
    }

    // Keep internal metadata synchronized with form fields.
    if ($("borStatus")) {
        $("borStatus").addEventListener("change", () => {
            if ($("borPreviewMetadataStatus")) $("borPreviewMetadataStatus").textContent = $("borStatus").value === "Hidden" ? "Hidden" : $("borStatus").value;
        });
    }
    if ($("borOrder")) {
        $("borOrder").addEventListener("input", () => {
            if ($("borPreviewMetadataOrder")) $("borPreviewMetadataOrder").textContent = $("borOrder").value || "—";
        });
    }

    // PHOTO UPLOAD

    if (photoInput) {
        photoInput.addEventListener("change", () => {
            const file = photoInput.files && photoInput.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file.");
                photoInput.value = "";
                return;
            }

            const maxSize = 10 * 1024 * 1024;

            if (file.size > maxSize) {
                alert("The image must be 10 MB or smaller.");
                photoInput.value = "";
                return;
            }

            clearTemporaryPhoto();

            temporaryPhotoUrl = URL.createObjectURL(file);
            currentPhotoUrl = temporaryPhotoUrl;

            updateFormPhotoPreview(currentPhotoUrl, $("borName").value);
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener("click", () => {
            clearTemporaryPhoto();

            currentPhotoUrl = "";

            if (photoInput) {
                photoInput.value = "";
            }

            updateFormPhotoPreview("", $("borName").value);
        });
    }

    if ($("borName")) {
        $("borName").addEventListener("input", () => {
            if (!currentPhotoUrl) {
                updateFormPhotoPreview("", $("borName").value);
            }
        });
    }

    // PREVIEW MODAL

    function showRegentPreview() {
        if (!form.reportValidity()) return;

        const item = readForm();

        if (!item) return;

        $("borPreviewTitle").textContent = "Regent Preview";

        $("borPreviewName").textContent = item.name;
        $("borPreviewPosition").textContent = item.position;
        $("borPreviewBio").textContent =
            item.bio || "No additional description provided.";
        $("borPreviewOrder").textContent =
            `Display order: ${item.order}`;

        setStatusBadge($("borPreviewStatus"), item.status);
        if ($("borPreviewMetadataId")) $("borPreviewMetadataId").textContent = editingId === null ? "Assigned when saved" : `EO-${String(editingId).padStart(4, "0")}`;
        if ($("borPreviewMetadataStatus")) $("borPreviewMetadataStatus").textContent = item.status === "Hidden" ? "Hidden" : item.status;
        if ($("borPreviewMetadataOrder")) $("borPreviewMetadataOrder").textContent = String(item.order);

        const previewInitials = $("borPreviewInitials");
        const previewImage = $("borPreviewImage");

        if (previewInitials) {
            previewInitials.textContent = getInitials(item.name);
            previewInitials.hidden = Boolean(currentPhotoUrl);
        }

        if (previewImage) {
            setImage(previewImage, currentPhotoUrl, previewInitials);
        }

        showModal(previewModal);
    }

    function returnToRegentForm() {
        closeModal(previewModal);
        showModal(modal);
    }

    // VIEW DETAILS MODAL
    function openViewModal(id) {
        const item = regents.find((regent) => regent.id === id);

        if (!item) return;

        $("borViewTitle").textContent = "Regent Preview";
        $("borViewName").textContent = item.name;
        $("borViewPosition").textContent = item.position;
        $("borViewBio").textContent =
            item.bio || "No additional description provided.";

        if ($("borViewOrder")) {
            $("borViewOrder").textContent = `Display order: ${item.order}`;
        }

        setStatusBadge($("borViewStatus"), item.status);
        if ($("borViewMetadataId")) $("borViewMetadataId").textContent = `EO-${String(item.id).padStart(4, "0")}`;
        if ($("borViewMetadataStatus")) $("borViewMetadataStatus").textContent = item.status === "Hidden" ? "Hidden" : item.status;
        if ($("borViewMetadataOrder")) $("borViewMetadataOrder").textContent = String(item.order);

        const photoContainer = document.querySelector("#viewModal .details-photo");

        if (photoContainer) {
            let image = $("borViewImage");
            let initials = $("borViewInitials");

            // Support either the supplied IDs or the original markup.
            if (!image) {
                image = photoContainer.querySelector("img");

                if (!image) {
                    image = document.createElement("img");
                    image.id = "viewImage";
                    image.alt = "";
                    photoContainer.appendChild(image);
                }
            }

            if (!initials) {
                initials = photoContainer.querySelector("span");

                if (!initials) {
                    initials = document.createElement("span");
                    initials.id = "viewInitials";
                    photoContainer.appendChild(initials);
                }
            }

            initials.textContent = getInitials(item.name);
            initials.hidden = Boolean(getPhoto(item));

            setImage(image, getPhoto(item), initials);
        }

        showModal(viewModal);
    }


    // EVENT LISTENERS
    if ($("addBorBtn")) {
        $("addBorBtn").addEventListener("click", () => {
            openRegentModal();
        });
    }

    if ($("closeBorModal")) {
        $("closeBorModal").addEventListener("click", closeRegentModal);
    }

    if ($("cancelBorBtn")) {
        $("cancelBorBtn").addEventListener("click", closeRegentModal);
    }

    if ($("previewBorFormBtn")) {
        $("previewBorFormBtn").addEventListener(
            "click",
            showRegentPreview
        );
    }

    if ($("closeBorPreview")) {
        $("closeBorPreview").addEventListener("click", () => {
            closeModal(previewModal);
            showModal(modal);
        });
    }

    if ($("closeBorView")) {
        $("closeBorView").addEventListener("click", () => {
            closeModal(viewModal);
        });
    }

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            saveRegent();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => { currentPage = 1; renderRegents(); });
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", () => { currentPage = 1; renderRegents(); });
    }
    if (orderFilter) {
        orderFilter.addEventListener("change", () => { currentPage = 1; renderRegents(); });
    }

    if (tableBody) {
        tableBody.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action]");

            if (!button) return;

            const id = Number(button.dataset.id);
            const action = button.dataset.action;
            const item = regents.find((regent) => regent.id === id);

            if (!item) return;

            if (action === "view") {
                openViewModal(id);
            }

            if (action === "edit") {
                openRegentModal(id);
            }

            if (action === "delete") {
                const confirmed = window.confirm(
                    `Are you sure you want to delete "${item.name}"?`
                );

                if (!confirmed) return;

                regents = regents.filter(
                    (regent) => regent.id !== id
                );

                renderRegents();
            }
        });
    }

    // Close a modal by clicking its backdrop.
    [modal, previewModal, viewModal].forEach((element) => {
        if (!element) return;

        element.addEventListener("click", (event) => {
            if (event.target !== element) return;

            if (element === previewModal) {
                closeModal(previewModal);
                closeRegentModal();
                return;
            }

            closeModal(element);
        });
    });

    // Escape closes the topmost visible modal.
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        if (viewModal && !viewModal.hidden) {
            closeModal(viewModal);
        } else if (previewModal && !previewModal.hidden) {
            closeModal(previewModal);
            showModal(modal);
        } else if (modal && !modal.hidden) {
            closeRegentModal();
        }
    });

    // INITIALIZE
    renderRegents();
    refreshIcons();
});
