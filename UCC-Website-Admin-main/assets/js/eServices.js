
document.addEventListener("DOMContentLoaded", function () {

    // Initialize Lucide icons.
    function refreshIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    refreshIcons();

    // SIDEBAR
    document.querySelectorAll(".menu-title").forEach(function (button) {
        button.addEventListener("click", function () {
            button.parentElement.classList.toggle("open");
        });
    });

    // MAIN ELEMENTS
    const searchInput = document.getElementById("serviceSearch");
    const servicesGrid = document.getElementById("servicesGrid");
    const noServices = document.getElementById("noServices");
    const addServiceBtn = document.getElementById("addServiceBtn");

    // ADD / EDIT MODAL
    const modal = document.getElementById("serviceModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const serviceForm = document.getElementById("serviceForm");
    const modalClose = document.getElementById("modalClose");
    const modalCancel = document.getElementById("modalCancel");

    // FORM FIELDS
    const serviceName = document.getElementById("serviceName");
    const serviceCategory = document.getElementById("serviceCategory");
    const serviceDescription = document.getElementById("serviceDescription");
    const serviceUrl = document.getElementById("serviceUrl");

    // LOGO CONTROLS
    const logoInput = document.getElementById("serviceLogo");
    const logoPreview = document.getElementById("serviceLogoPreview");
    const defaultLogoIcon = document.getElementById("defaultLogoIcon");
    const removeLogoBtn = document.getElementById("removeServiceLogo");

    // PREVIEW MODAL
    const previewModal = document.getElementById("servicePreviewModal");
    const previewBtn = document.getElementById("previewServiceBtn");
    const closePreviewBtn = document.getElementById("closeServicePreview");

    const previewName = document.getElementById("previewServiceName");
    const previewCategory = document.getElementById("previewServiceCategory");
    const previewDescription = document.getElementById("previewServiceDescription");
    const previewLogo = document.getElementById("previewServiceLogo");
    const previewDefaultIcon = document.getElementById("previewDefaultIcon");
    const previewLink = document.getElementById("previewServiceLink");

    // STATE
    let editingCard = null;
    let selectedLogo = "";
    let selectedLogoObjectUrl = "";
    let logoRemoved = false;

    // Identifies the modal to reopen when the preview closes.
    // "none" means the preview was opened from an existing card.
    let previewReturnTo = "none";

    // Temporary uploaded image URL cleanup.
    function clearTemporaryLogoUrl() {
        if (selectedLogoObjectUrl) {
            URL.revokeObjectURL(selectedLogoObjectUrl);
            selectedLogoObjectUrl = "";
        }
    }

    // Modal visibility helpers.
    function openModal(element) {
        element.classList.add("show");
        element.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal(element) {
        element.classList.remove("show");
        element.setAttribute("aria-hidden", "true");

        if (!document.querySelector(
            ".service-modal.show, .service-preview-modal.show"
        )) {
            document.body.style.overflow = "";
        }
    }

    // Safely accept only HTTP and HTTPS URLs.
    function getSafeWebsiteUrl(value) {
        try {
            const parsed = new URL(value);

            if (parsed.protocol === "http:" ||
                parsed.protocol === "https:") {
                return parsed.href;
            }
        } catch (error) {
            return "";
        }

        return "";
    }

    // Update the form's logo preview.
    function updateFormLogoPreview() {
        if (selectedLogo && !logoRemoved) {
            logoPreview.src = selectedLogo;
            logoPreview.hidden = false;
            defaultLogoIcon.hidden = true;
        } else {
            logoPreview.removeAttribute("src");
            logoPreview.hidden = true;
            defaultLogoIcon.hidden = false;
        }

        removeLogoBtn.disabled = !selectedLogo && !logoRemoved;
        refreshIcons();
    }

    // Update the preview modal's logo.
    function updatePreviewLogo(logo) {
        if (logo) {
            previewLogo.src = logo;
            previewLogo.hidden = false;
            previewDefaultIcon.hidden = true;
        } else {
            previewLogo.removeAttribute("src");
            previewLogo.hidden = true;
            previewDefaultIcon.hidden = false;
        }
    }

    // Get a card's current logo.
    function getCardLogo(card) {
        const image = card.querySelector(".service-icon img");

        if (image && image.getAttribute("src")) {
            return image.getAttribute("src");
        }

        return "";
    }

    // Set a card's logo or default icon.
    function setCardLogo(card, logo) {
        const iconContainer = card.querySelector(".service-icon");

        if (logo) {
            iconContainer.replaceChildren();

            const image = document.createElement("img");
            image.src = logo;
            image.alt = "Service logo";

            iconContainer.appendChild(image);
        } else {
            iconContainer.replaceChildren();

            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "globe");

            iconContainer.appendChild(icon);
        }

        refreshIcons();
    }

    // Reset form fields and image state.
    function resetServiceForm() {
        serviceForm.reset();

        clearTemporaryLogoUrl();

        selectedLogo = "";
        logoRemoved = false;

        logoInput.value = "";

        updateFormLogoPreview();
    }

    // Open the Add or Edit modal.
    function openServiceForm(mode, card = null) {
        editingCard = card;

        resetServiceForm();

        const isEditing = mode === "edit";

        modalTitle.textContent = isEditing
            ? "Edit E-Service"
            : "Add E-Service";

        modalSubtitle.textContent = isEditing
            ? "Update the information for this e-service."
            : "Enter the information for this e-service.";

        if (card) {
            serviceName.value =
                card.querySelector(".service-card-content h3").textContent.trim();

            serviceCategory.value =
                card.querySelector(".service-card-content span").textContent.trim();

            serviceDescription.value =
                card.querySelector(".service-card-content p").textContent.trim();

            const existingHref =
                card.querySelector(".service-card-footer a").getAttribute("href") || "";

            serviceUrl.value =
                existingHref === "#" ? "" : existingHref;

            selectedLogo = getCardLogo(card);
            logoRemoved = false;

            updateFormLogoPreview();
        }

        openModal(modal);
    }

    // ADD SERVICE
    addServiceBtn.addEventListener("click", function () {
        openServiceForm("add");
    });

    // CLOSE ADD / EDIT MODAL
    modalClose.addEventListener("click", function () {
        closeModal(modal);
    });

    modalCancel.addEventListener("click", function () {
        closeModal(modal);
    });

    // UPLOAD LOGO
    logoInput.addEventListener("change", function () {
        const file = logoInput.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            logoInput.value = "";
            return;
        }

        clearTemporaryLogoUrl();

        selectedLogoObjectUrl = URL.createObjectURL(file);
        selectedLogo = selectedLogoObjectUrl;
        logoRemoved = false;

        updateFormLogoPreview();
    });

    // REMOVE LOGO
    removeLogoBtn.addEventListener("click", function () {
        logoInput.value = "";

        clearTemporaryLogoUrl();

        selectedLogo = "";
        logoRemoved = true;

        updateFormLogoPreview();
    });

    // POPULATE THE SHARED PREVIEW MODAL.
    // returnTo is "form" or "none".
    function showServicePreview(data, returnTo) {
        previewReturnTo = returnTo;

        previewName.textContent = data.name || "Service Name";
        previewCategory.textContent = data.category || "Category";

        previewDescription.textContent =
            data.description || "Service description will appear here.";

        updatePreviewLogo(data.logo || "");

        const safeUrl = getSafeWebsiteUrl(data.url || "");

        if (safeUrl) {
            previewLink.href = safeUrl;
            previewLink.style.display = "inline-flex";
        } else {
            previewLink.href = "#";
            previewLink.style.display = "inline-flex";
        }

        // Hide the source modal before showing the preview.
        closeModal(modal);
        openModal(previewModal);

        refreshIcons();
    }

    // PREVIEW FROM ADD / EDIT FORM.
    // Closing the preview returns to the same form.
    previewBtn.addEventListener("click", function () {
        showServicePreview({
            name: serviceName.value.trim(),
            category: serviceCategory.value.trim(),
            description: serviceDescription.value.trim(),
            url: serviceUrl.value.trim(),
            logo: logoRemoved ? "" : selectedLogo
        }, "form");
    });

    // CLOSE PREVIEW.
    // Existing-card previews return to the page.
    // Form previews return to the Add or Edit modal.
    function closeServicePreview() {
        closeModal(previewModal);

        if (previewReturnTo === "form") {
            openModal(modal);
        }

        previewReturnTo = "none";
    }

    closePreviewBtn.addEventListener("click", closeServicePreview);

    // Clicking outside the preview closes it.
    previewModal.addEventListener("click", function (event) {
        if (event.target === previewModal) {
            closeServicePreview();
        }
    });

    // Clicking outside the Add/Edit modal closes it.
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal(modal);
        }
    });

    // ESCAPE KEY.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }

        if (previewModal.classList.contains("show")) {
            closeServicePreview();
        } else if (modal.classList.contains("show")) {
            closeModal(modal);
        }
    });

    // SEARCH SERVICES.
    function filterServices() {
        const query = searchInput.value.toLowerCase().trim();
        const cards = servicesGrid.querySelectorAll(".service-card");

        let visibleCount = 0;

        cards.forEach(function (card) {
            const matches = card.textContent.toLowerCase().includes(query);

            card.hidden = !matches;

            if (matches) {
                visibleCount++;
            }
        });

        noServices.style.display = visibleCount === 0 ? "flex" : "none";
    }

    searchInput.addEventListener("input", filterServices);

    // CREATE A NEW SERVICE CARD.
    function createServiceCard(name, category, description, url, logo) {
        const card = document.createElement("article");
        card.className = "service-card";

        const top = document.createElement("div");
        top.className = "service-card-top";

        const iconContainer = document.createElement("div");
        iconContainer.className = "service-icon";

        const actions = document.createElement("div");
        actions.className = "service-actions";

        const actionDefinitions = [
            {
                className: "preview-action preview-card-action",
                icon: "eye",
                title: "Preview",
                label: "Preview " + name
            },
            {
                className: "edit-action",
                icon: "pencil",
                title: "Edit",
                label: "Edit " + name
            },
            {
                className: "delete-action",
                icon: "trash-2",
                title: "Delete",
                label: "Delete " + name
            }
        ];

        actionDefinitions.forEach(function (item) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "service-action " + item.className;
            button.title = item.title;
            button.setAttribute("aria-label", item.label);

            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", item.icon);

            button.appendChild(icon);
            actions.appendChild(button);
        });

        top.appendChild(iconContainer);
        top.appendChild(actions);

        const content = document.createElement("div");
        content.className = "service-card-content";

        const heading = document.createElement("h3");
        heading.textContent = name;

        const categoryText = document.createElement("span");
        categoryText.textContent = category;

        const descriptionText = document.createElement("p");
        descriptionText.textContent = description;

        content.appendChild(heading);
        content.appendChild(categoryText);
        content.appendChild(descriptionText);

        const footer = document.createElement("div");
        footer.className = "service-card-footer";

        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        link.appendChild(document.createTextNode("Visit Website "));

        const linkIcon = document.createElement("i");
        linkIcon.setAttribute("data-lucide", "arrow-up-right");

        link.appendChild(linkIcon);
        footer.appendChild(link);

        card.appendChild(top);
        card.appendChild(content);
        card.appendChild(footer);

        setCardLogo(card, logo);

        return card;
    }

    // SAVE FORM.
    serviceForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = serviceName.value.trim();
        const category = serviceCategory.value.trim();
        const description = serviceDescription.value.trim();
        const url = serviceUrl.value.trim();

        const safeUrl = getSafeWebsiteUrl(url);

        if (!safeUrl) {
            alert("Please enter a valid website URL beginning with http:// or https://.");
            serviceUrl.focus();
            return;
        }

        const logo = logoRemoved ? "" : selectedLogo;

        if (editingCard) {
            // UPDATE EXISTING CARD.
            editingCard.querySelector(".service-card-content h3").textContent = name;

            editingCard.querySelector(".service-card-content span").textContent =
                category;

            editingCard.querySelector(".service-card-content p").textContent =
                description;

            const link = editingCard.querySelector(".service-card-footer a");
            link.href = safeUrl;

            setCardLogo(editingCard, logo);

            // Update accessible action labels after a rename.
            editingCard.querySelector(".preview-card-action")
                .setAttribute("aria-label", "Preview " + name);

            editingCard.querySelector(".edit-action")
                .setAttribute("aria-label", "Edit " + name);

            editingCard.querySelector(".delete-action")
                .setAttribute("aria-label", "Delete " + name);

        } else {
            // ADD NEW CARD.
            const card = createServiceCard(
                name,
                category,
                description,
                safeUrl,
                logo
            );

            servicesGrid.appendChild(card);
        }

        filterServices();

        closeModal(modal);

        editingCard = null;

        clearTemporaryLogoUrl();
        selectedLogo = "";
        logoRemoved = false;

        refreshIcons();
    });

    // CARD ACTIONS: PREVIEW, EDIT, DELETE.
    servicesGrid.addEventListener("click", function (event) {
        const previewButton = event.target.closest(".preview-card-action");
        const editButton = event.target.closest(".edit-action");
        const deleteButton = event.target.closest(".delete-action");

        if (previewButton) {
            const card = previewButton.closest(".service-card");

            showServicePreview({
                name: card.querySelector(".service-card-content h3").textContent.trim(),

                category: card.querySelector(".service-card-content span")
                    .textContent.trim(),

                description: card.querySelector(".service-card-content p")
                    .textContent.trim(),

                url: card.querySelector(".service-card-footer a")
                    .getAttribute("href") || "",

                logo: getCardLogo(card)
            }, "none");

            return;
        }

        if (editButton) {
            openServiceForm("edit", editButton.closest(".service-card"));
            return;
        }

        if (deleteButton) {
            const card = deleteButton.closest(".service-card");

            const name = card.querySelector(
                ".service-card-content h3"
            ).textContent.trim();

            if (confirm('Are you sure you want to delete "' + name + '"?')) {
                card.remove();
                filterServices();
            }
        }
    });

    // INITIALIZE SEARCH RESULTS.
    filterServices();

    // Ensure the initial page has rendered all icons.
    refreshIcons();

});