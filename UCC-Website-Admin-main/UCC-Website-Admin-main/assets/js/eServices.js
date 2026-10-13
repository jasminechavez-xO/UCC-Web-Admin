
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const PAGE_SIZE = 5;

  let services = [];
  let nextId = 1;
  let showingAll = false;
  let editingId = null;
  let logoData = "";

  const nowISO = () => new Date().toISOString();

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function icon(name) {
    return `<i data-lucide="${name}" aria-hidden="true"></i>`;
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function safeWebsiteUrl(value) {
    if (!value) return "";

    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol)
        ? url.href
        : "";
    } catch {
      return "";
    }
  }

  // Read the hardcoded HTML table into the working data model.
  function loadHardcodedRows() {
    const rows = [...$("servicesTableBody").querySelectorAll("tr[data-id]")];

    services = rows.map((row, index) => {
      const cells = row.querySelectorAll("td");
      const id = Number(row.dataset.id) || index + 1;

      const name = cells[0]?.querySelector("strong")?.textContent.trim() || "";
      const description = cells[1]?.textContent.trim() || "";
      const link = cells[2]?.querySelector("a");
      const rawUrl = link?.getAttribute("href") || "";
      const statusText = cells[3]?.querySelector(".service-status")?.textContent.trim() || "Active";

      return {
        id,
        name,
        description,
        url: safeWebsiteUrl(rawUrl),
        status: statusText === "Hidden" ? "Hidden" : "Active",
        logo: "",
        created: index + 1,
        createdBy: "—",
        createdAt: "",
        updatedBy: "—",
        updatedAt: ""
      };
    });

    nextId = services.reduce((max, service) => Math.max(max, service.id), 0) + 1;
  }

  function getFilteredServices() {
    const query = $("serviceSearch").value.trim().toLowerCase();
    const status = $("serviceStatusFilter").value;
    const sort = $("serviceSort").value;

    const result = services.filter((service) => {
      const text = `${service.name} ${service.description} ${service.url}`.toLowerCase();

      return (!query || text.includes(query)) &&
        (status === "all" || service.status === status);
    });

    result.sort((a, b) => {
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "newest") return b.created - a.created;
      if (sort === "oldest") return a.created - b.created;
      return a.name.localeCompare(b.name);
    });

    return result;
  }

  function render() {
    const result = getFilteredServices();
    const visible = showingAll ? result : result.slice(0, PAGE_SIZE);
    const tbody = $("servicesTableBody");

    $("serviceCount").textContent =
      `${result.length} ${result.length === 1 ? "service" : "services"}`;

    if (visible.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="services-empty-row">
            ${icon("inbox")}
            <br>
            <strong>No e-services found.</strong>
            <br>
            Try changing your search or add an e-service.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = visible.map((service) => {
        const website = safeWebsiteUrl(service.url);
        const statusClass = service.status === "Active" ? "active" : "hidden";

        return `
          <tr data-id="${service.id}">
            <td>
              <div class="service-name-cell">
                <div class="service-logo-cell">
                  ${
                    service.logo
                      ? `<img src="${service.logo}" alt="">`
                      : icon("globe")
                  }
                </div>
                <div>
                  <strong>${escapeHtml(service.name)}</strong>
                  <small>E-Service</small>
                </div>
              </div>
            </td>

            <td>${escapeHtml(service.description)}</td>

            <td>
              <div class="service-website-cell">
                ${
                  website
                    ? `<a class="service-link"
                         href="${escapeHtml(website)}"
                         target="_blank"
                         rel="noopener noreferrer">
                         ${escapeHtml(website)}
                         ${icon("arrow-up-right")}
                       </a>`
                    : `<span class="muted">No website URL</span>`
                }
              </div>
            </td>

            <td>
              <span class="service-status ${statusClass}">
                ${escapeHtml(service.status)}
              </span>
            </td>

            <td>
              <div class="service-row-actions">
                <button class="service-action preview-action"
                  type="button" data-action="preview" data-id="${service.id}"
                  title="View" aria-label="View ${escapeHtml(service.name)}">
                  ${icon("eye")}
                </button>

                <button class="service-action edit-action"
                  type="button" data-action="edit" data-id="${service.id}"
                  title="Edit" aria-label="Edit ${escapeHtml(service.name)}">
                  ${icon("pencil")}
                </button>

                <button class="service-action delete-action"
                  type="button" data-action="delete" data-id="${service.id}"
                  title="Delete" aria-label="Delete ${escapeHtml(service.name)}">
                  ${icon("trash-2")}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    const showMore = $("showMoreServicesBtn");
    showMore.hidden = result.length <= PAGE_SIZE;
    showMore.textContent = showingAll ? "Show less" : "Show more";
    showMore.setAttribute("aria-expanded", String(showingAll));

    $("servicesEndMessage").hidden =
      !(showingAll && result.length > PAGE_SIZE);

    refreshIcons();
  }

  // Photo preview
  function updateLogoPreview() {
    const image = $("serviceLogoPreview");
    const hasLogo = Boolean(logoData);

    image.src = hasLogo ? logoData : "";
    image.hidden = !hasLogo;
    $("defaultLogoIcon").hidden = hasLogo;

    $("logoPreviewContainer").classList.toggle("has-logo", hasLogo);
    $("removeServiceLogo").hidden = !hasLogo;

    refreshIcons();
  }

  function updateMetadata(service) {
    $("metadataCreatedBy").textContent = service?.createdBy || "—";
    $("metadataCreatedDate").textContent = formatDate(service?.createdAt);
    $("metadataUpdatedBy").textContent = service?.updatedBy || "—";
  }

  function openForm(service = null) {
    editingId = service ? service.id : null;
    logoData = service?.logo || "";

    $("modalTitle").textContent = service ? "Edit E-Service" : "Add E-Service";
    $("modalSubtitle").textContent = service
      ? "Update the information for this e-service."
      : "Enter the information for this e-service.";

    $("serviceName").value = service?.name || "";
    $("serviceDescription").value = service?.description || "";
    $("serviceUrl").value = service?.url || "";
    $("serviceStatus").value = service?.status || "Active";
    $("serviceLogo").value = "";

    updateLogoPreview();
    updateMetadata(service);

    $("serviceModal").classList.add("open");
    $("serviceModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    refreshIcons();
    $("serviceName").focus();
  }

  function closeForm() {
    $("serviceModal").classList.remove("open");
    $("serviceModal").setAttribute("aria-hidden", "true");

    if (!$("servicePreviewModal").classList.contains("open")) {
      document.body.classList.remove("modal-open");
    }
  }

  function getFormPreviewData() {
    return {
      name: $("serviceName").value.trim() || "Service name",
      description: $("serviceDescription").value.trim() || "Service description will appear here.",
      url: safeWebsiteUrl($("serviceUrl").value.trim()),
      status: $("serviceStatus").value,
      logo: logoData
    };
  }

  function openPreview(service = null) {
    const data = service || getFormPreviewData();
    const hasLogo = Boolean(data.logo);

    $("previewServiceName").textContent = data.name;
    $("previewServiceDescription").textContent = data.description;

    $("previewServiceLogo").src = hasLogo ? data.logo : "";
    $("previewServiceLogo").hidden = !hasLogo;
    $("previewDefaultIcon").hidden = hasLogo;

    const status = $("previewServiceStatus");
    status.textContent = data.status;
    status.classList.toggle("active", data.status === "Active");
    status.classList.toggle("hidden", data.status === "Hidden");

    const link = $("previewServiceLink");
    const website = safeWebsiteUrl(data.url);

    if (website) {
      link.href = website;
      link.hidden = false;
    } else {
      link.removeAttribute("href");
      link.hidden = true;
    }

    $("servicePreviewModal").classList.add("open");
    $("servicePreviewModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    refreshIcons();
  }

  function closePreview() {
    $("servicePreviewModal").classList.remove("open");
    $("servicePreviewModal").setAttribute("aria-hidden", "true");

    if (!$("serviceModal").classList.contains("open")) {
      document.body.classList.remove("modal-open");
    }
  }

  // Toolbar actions.
  $("addServiceBtn").addEventListener("click", () => openForm());
  $("modalClose").addEventListener("click", closeForm);
  $("modalCancel").addEventListener("click", closeForm);
  $("closeServicePreview").addEventListener("click", closePreview);

  $("chooseServicePhoto").addEventListener("click", () => {
    $("serviceLogo").click();
  });

  $("previewServiceBtn").addEventListener("click", () => {
    openPreview();
  });

  $("showMoreServicesBtn").addEventListener("click", () => {
    showingAll = !showingAll;
    render();
  });

  $("serviceSearch").addEventListener("input", () => {
    showingAll = false;
    render();
  });

  $("serviceStatusFilter").addEventListener("change", () => {
    showingAll = false;
    render();
  });

  $("serviceSort").addEventListener("change", () => {
    showingAll = false;
    render();
  });

  // Row actions.
  $("servicesTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const service = services.find((item) => item.id === id);
    if (!service) return;

    switch (button.dataset.action) {
      case "preview":
        openPreview(service);
        break;

      case "edit":
        openForm(service);
        break;

      case "delete":
        if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
          services = services.filter((item) => item.id !== id);
          render();
        }
        break;
    }
  });

  // Read the selected image as a data URL.
  $("serviceLogo").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert("Please choose a photo smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      logoData = String(reader.result || "");
      updateLogoPreview();
    };

    reader.onerror = () => {
      window.alert("Unable to read this photo. Please try another image.");
    };

    reader.readAsDataURL(file);
  });

  $("removeServiceLogo").addEventListener("click", () => {
    logoData = "";
    $("serviceLogo").value = "";
    updateLogoPreview();
  });

  // Add or edit a service.
  $("serviceForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("serviceName").value.trim();
    const description = $("serviceDescription").value.trim();
    const rawUrl = $("serviceUrl").value.trim();
    const status = $("serviceStatus").value;

    if (!name || !description) {
      window.alert("Please complete the service name and description.");
      return;
    }

    let url = "";

    if (rawUrl) {
      url = safeWebsiteUrl(rawUrl);

      if (!url) {
        window.alert("Please enter a valid website URL starting with http:// or https://.");
        $("serviceUrl").focus();
        return;
      }
    }

    const now = nowISO();

    if (editingId !== null) {
      services = services.map((service) => {
        if (service.id !== editingId) return service;

        return {
          ...service,
          name,
          description,
          url,
          status,
          logo: logoData,
          updatedBy: "Admin",
          updatedAt: now
        };
      });
    } else {
      services.push({
        id: nextId++,
        name,
        description,
        url,
        status,
        logo: logoData,
        created: Date.now(),
        createdBy: "Admin",
        createdAt: now,
        updatedBy: "—",
        updatedAt: ""
      });
    }

    showingAll = false;
    closeForm();
    render();
  });

  // Backdrop click closes the appropriate modal.
  document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeForm);
  });

  document.querySelectorAll("[data-close-preview]").forEach((element) => {
    element.addEventListener("click", closePreview);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeForm();
      closePreview();
    }
  });

  // Start from the hardcoded HTML rows.
  loadHardcodedRows();
  render();
})();
