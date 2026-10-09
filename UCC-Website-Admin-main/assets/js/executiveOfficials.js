


document.addEventListener("DOMContentLoaded", () => {
    "use strict";

   
    // SIDEBAR
    
    document.querySelectorAll(".menu-title").forEach((button) => {
        button.addEventListener("click", () => {
            button.parentElement.classList.toggle("open");
        });
    });

    

    let officials = [
        ["EO-NAS.png", "Atty. Jessamine Jared S. Nas", "THE UNIVERSITY PRESIDENT", "Officer-in-Charge"],
        ["EO-LOPEZ.png", "Engr. Wenald H. Lopez, PhD", "VP for Academic Affairs", "Dean, College of Engineering"],
        ["EO-DANTAY.png", "Rodrigo M. Dantay Jr., DPA, EdD", "Vice President for Student Affairs and Services", ""],
        ["EO-PRADO.png", "Ramona A. Prado, EdD, LPT", "Vice President for Quality Assurance", "Dean, College of Education"],
        ["EO-ENRIQUEZ.png", "Bernadette B. Enriquez, DPA, LPT, CESE", "Vice President for Research and Community Extension Services", "Dean, College of Liberal Arts and Sciences"],
        ["EO-BAUTISTA.png", "Melinda M. Bautista, DPA, LPT", "Vice President for Planning", ""],
        ["EO-MACKAY.png", "Eloisa P. Mackay, PhD, LPT", "VP for Administration", "Dean, College of Business and Accountancy"],
        ["EO-CARANDANG.png", "Reynaldo H. Carandang Jr., MBA", "AVP for Administration (Operations)", ""],
        ["EO-LEON.png", "Ms. Edna R. De Leon", "AVP for Administration (Finance and Human Resource Management)", ""],
        ["EO-REYES.png", "Dionisio S. Reyes, DPA, LPT", "AVP for Quality Assurance", ""],
        ["EO-MACARAEG.png", "Teodoro A. Macaraeg Jr., DPA, DIT", "AVP for Research", ""],
        ["EO-ESPINO.png", "Anna Lea Sheryl P. Espino, MAEd, LPT", "AVP for Student Affairs and Services", "University Registrar, North"],
        ["EO-AGUILAR.png", "Janette L. Aguilar, DBA", "AVP for Community and Extension Services", ""],
        ["EO-DEMESA.png", "Juanito R. De Mesa III, DPA", "AVP for Institutional Planning", ""],
        ["EO-JULIANES.png", "Melchor S. Julianes, EdD, PhD, DPA, DBA", "Dean of Graduate School", ""],
        ["EO-CALIZAR.png", "Atty. Dexter B. Calizar", "Officer-in-Charge, College of Law", ""],
        ["EO-DIZON.png", "Nelson C. Dizon, PhD Crim, RCrim", "Dean, College of Criminal Justice Education", ""],
        ["EO.PILI.png", "Ms. Allora C. Pili", "Director, Human Resources Management Office", ""],
        ["EO-MARIANO.png", "Monica B. Mariano, CPA", "Director, Finance and Accounting", ""],
        ["EO-SAENZ.png", "Ma. Cecilia M. Saenz, DPA, LPT, RPM", "University Registrar, South", ""],
        ["EO-VICTORIA.png", "Efren P. Victoria, MIT", "Director, Management Information System", ""],
        ["EO-YEE.png", "Catlleya C. Yee, PhD-ELL, LPT", "Board Secretary", ""],
        ["EO-NACIONALES.png", "Ms. Ailamarie R. Nacionales", "Executive Assistant to the Office of the President", ""]
    ].map((item, index) => ({
        id: index + 1,
        photo: item[0],
        photoUrl: "",
        name: item[1],
        position: item[2],
        bio: item[3] || "",
        status: "Active",
        order: index + 1
    }));

    // -----------------------------------------------------
    // ELEMENTS
    // -----------------------------------------------------

    const $ = (id) => document.getElementById(id);

    const tableBody = $("officialsTableBody");
    const searchInput = $("officialSearch");
    const statusFilter = $("officialStatusFilter");
    const resultCount = $("resultCount");
    const emptyState = $("emptyState");
    const tableWrap = $("officialsTableWrap");

    const modal = $("officialModal");
    const previewModal = $("officialPreviewModal");
    const viewModal = $("viewModal");
    const form = $("officialForm");

    const photoInput = $("officialPhoto");
    const uploadImage = $("officialUploadImage");
    const uploadInitials = $("officialUploadInitials");
    const removePhotoBtn = $("removeOfficialPhoto");

    let editingId = null;
    let nextId = officials.length + 1;
    let currentPhotoUrl = "";
    let temporaryPhotoUrl = "";
    let modalReturnFocus = null;

    // -----------------------------------------------------
    // GENERAL HELPERS
    // -----------------------------------------------------

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

        if (!words.length) return "EO";

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
            return value;
        }

        return `images/${value}`;
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

    function getFilteredOfficials() {
        const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const selectedStatus = statusFilter ? statusFilter.value : "all";

        return officials
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
                    item.status.toLowerCase() === selectedStatus;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => a.order - b.order || a.id - b.id);
    }

    // -----------------------------------------------------
    // RENDER TABLE
    // -----------------------------------------------------

    function renderOfficials() {
        if (!tableBody) return;

        const filtered = getFilteredOfficials();

        tableBody.innerHTML = filtered.map((item) => {
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
                            title="Edit official"
                            aria-label="Edit ${name}"
                            data-action="edit"
                            data-id="${item.id}">
                            <i data-lucide="pencil"></i>
                        </button>

                        <button
                            class="icon-btn delete"
                            type="button"
                            title="Delete official"
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

        if (resultCount) {
            resultCount.textContent =
                `${filtered.length} ${filtered.length === 1 ? "official" : "officials"}`;
        }

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

    // -----------------------------------------------------
    // FORM AND PHOTO PREVIEW
    // -----------------------------------------------------

    function updateFormPhotoPreview(url, name) {
        if (uploadInitials) {
            uploadInitials.textContent = getInitials(name || "Executive Official");
            uploadInitials.hidden = Boolean(url);
        }

        if (uploadImage) {
            setImage(uploadImage, url, uploadInitials);
        }
    }

    function clearTemporaryPhoto() {
        if (temporaryPhotoUrl) {
            URL.revokeObjectURL(temporaryPhotoUrl);
            temporaryPhotoUrl = "";
        }
    }

    function openOfficialModal(id = null) {
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
                order: officials.length + 1
            }
            : officials.find((official) => official.id === id);

        if (!item) return;

        form.reset();

        $("modalTitle").textContent =
            id === null ? "Add Official" : "Edit Official";

        $("name").value = item.name;
        $("position").value = item.position;
        $("bio").value = item.bio;
        $("displayOrder").value = item.order;
        $("status").value = item.status;

        currentPhotoUrl = item.photoUrl || "";
        const photo = getPhoto(item);

        if (photoInput) {
            photoInput.value = "";
        }

        updateFormPhotoPreview(photo, item.name);

        showModal(modal);

        if ($("name")) {
            $("name").focus();
        }
    }

    function closeOfficialModal() {
        closeModal(modal, true);
        clearTemporaryPhoto();
    }

    function readForm() {
        const name = $("name").value.trim();
        const position = $("position").value.trim();
        const bio = $("bio").value.trim();
        const status = $("status").value;
        const order = Number($("displayOrder").value);

        if (!name || !position) {
            form.reportValidity();
            return null;
        }

        if (!Number.isInteger(order) || order < 1) {
            $("displayOrder").setCustomValidity(
                "Display order must be a whole number greater than zero."
            );
            $("displayOrder").reportValidity();
            $("displayOrder").setCustomValidity("");
            return null;
        }

        const previous = editingId === null
            ? null
            : officials.find((item) => item.id === editingId);

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

    function saveOfficial() {
        if (!form.reportValidity()) return;

        const item = readForm();

        if (!item) return;

        if (editingId === null) {
            officials.push(item);
            nextId += 1;
        } else {
            const index = officials.findIndex(
                (official) => official.id === editingId
            );

            if (index === -1) return;

            officials[index] = item;
        }

        clearTemporaryPhoto();

        closeModal(modal);
        closeModal(previewModal);

        editingId = null;
        currentPhotoUrl = "";

        renderOfficials();
        syncModalState();
    }

    // -----------------------------------------------------
    // PHOTO UPLOAD
    // -----------------------------------------------------

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

            updateFormPhotoPreview(currentPhotoUrl, $("name").value);
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener("click", () => {
            clearTemporaryPhoto();

            currentPhotoUrl = "";

            if (photoInput) {
                photoInput.value = "";
            }

            updateFormPhotoPreview("", $("name").value);
        });
    }

    if ($("name")) {
        $("name").addEventListener("input", () => {
            if (!currentPhotoUrl) {
                updateFormPhotoPreview("", $("name").value);
            }
        });
    }

    // -----------------------------------------------------
    // PREVIEW MODAL
    // -----------------------------------------------------

    function showOfficialPreview() {
        if (!form.reportValidity()) return;

        const item = readForm();

        if (!item) return;

        $("officialPreviewTitle").textContent =
            editingId === null ? "New Official Preview" : "Edit Official Preview";

        $("officialPreviewName").textContent = item.name;
        $("officialPreviewPosition").textContent = item.position;
        $("officialPreviewBio").textContent =
            item.bio || "No additional description provided.";
        $("officialPreviewOrder").textContent =
            `Display order: ${item.order}`;

        setStatusBadge($("officialPreviewStatus"), item.status);

        const previewInitials = $("officialPreviewInitials");
        const previewImage = $("officialPreviewImage");

        if (previewInitials) {
            previewInitials.textContent = getInitials(item.name);
            previewInitials.hidden = Boolean(currentPhotoUrl);
        }

        if (previewImage) {
            setImage(previewImage, currentPhotoUrl, previewInitials);
        }

        showModal(previewModal);
    }

    function returnToOfficialForm() {
        closeModal(previewModal);
        showModal(modal);
    }

    // -----------------------------------------------------
    // VIEW DETAILS MODAL
    // -----------------------------------------------------

    function openViewModal(id) {
        const item = officials.find((official) => official.id === id);

        if (!item) return;

        $("viewModalTitle").textContent = item.name;
        $("viewName").textContent = item.name;
        $("viewPosition").textContent = item.position;
        $("viewBio").textContent =
            item.bio || "No additional description provided.";

        if ($("viewOrder")) {
            $("viewOrder").textContent = `Display order: ${item.order}`;
        }

        setStatusBadge($("viewStatus"), item.status);

        const photoContainer = document.querySelector("#viewModal .details-photo");

        if (photoContainer) {
            let image = $("viewImage");
            let initials = $("viewInitials");

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

    // -----------------------------------------------------
    // EVENT LISTENERS
    // -----------------------------------------------------

    if ($("addOfficialBtn")) {
        $("addOfficialBtn").addEventListener("click", () => {
            openOfficialModal();
        });
    }

    if ($("closeModalBtn")) {
        $("closeModalBtn").addEventListener("click", closeOfficialModal);
    }

    if ($("cancelBtn")) {
        $("cancelBtn").addEventListener("click", closeOfficialModal);
    }

    if ($("previewOfficialFormBtn")) {
        $("previewOfficialFormBtn").addEventListener(
            "click",
            showOfficialPreview
        );
    }

    if ($("closeOfficialPreview")) {
        $("closeOfficialPreview").addEventListener("click", () => {
            closeModal(previewModal);
            closeOfficialModal();
        });
    }

    if ($("backToOfficialForm")) {
        $("backToOfficialForm").addEventListener(
            "click",
            returnToOfficialForm
        );
    }

    if ($("saveOfficialFromPreview")) {
        $("saveOfficialFromPreview").addEventListener("click", saveOfficial);
    }

    if ($("closeViewBtn")) {
        $("closeViewBtn").addEventListener("click", () => {
            closeModal(viewModal);
        });
    }

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            saveOfficial();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", renderOfficials);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", renderOfficials);
    }

    if (tableBody) {
        tableBody.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action]");

            if (!button) return;

            const id = Number(button.dataset.id);
            const action = button.dataset.action;
            const item = officials.find((official) => official.id === id);

            if (!item) return;

            if (action === "view") {
                openViewModal(id);
            }

            if (action === "edit") {
                openOfficialModal(id);
            }

            if (action === "delete") {
                const confirmed = window.confirm(
                    `Are you sure you want to delete "${item.name}"?`
                );

                if (!confirmed) return;

                officials = officials.filter(
                    (official) => official.id !== id
                );

                renderOfficials();
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
                closeOfficialModal();
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
            closeOfficialModal();
        }
    });

    // -----------------------------------------------------
    // INITIALIZE
    // -----------------------------------------------------

    renderOfficials();
    refreshIcons();
});
