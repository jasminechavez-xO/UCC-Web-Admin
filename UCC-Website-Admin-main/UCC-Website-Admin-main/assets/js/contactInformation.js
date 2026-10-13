
(() => {
  "use strict";

  // ==========================================
  // ELEMENT REFERENCES
  // ==========================================

  const $ = id => document.getElementById(id);

  const formModal = $("contactFormModal");
  const previewModal = $("contactPreviewModal");

  const form = $("contactForm");
  const tbody = $("contactTableBody");
  const search = $("contactSearch");

  const pageSize = 5;

  let showAll = false;
  let editingId = null;
  let nextId = 6;

  // ==========================================
  // INITIAL CONTACT DATA
  // ==========================================

  let contacts = [
    {
      id: 1,
      name: "University Registrar",
      email: "registrar@ucc.edu.ph",
      number: "(02) 5310 1234",
      status: "Active",
      createdBy: "Administrator",
      createdAt: "Oct 01, 2026",
      updatedBy: "—"
    },
    {
      id: 2,
      name: "Admissions Office",
      email: "admissions@ucc.edu.ph",
      number: "(02) 5310 1235",
      status: "Active",
      createdBy: "Administrator",
      createdAt: "Oct 02, 2026",
      updatedBy: "—"
    },
    {
      id: 3,
      name: "Public Information Office",
      email: "pio@ucc.edu.ph",
      number: "(02) 5310 1236",
      status: "Active",
      createdBy: "Administrator",
      createdAt: "Oct 03, 2026",
      updatedBy: "—"
    },
    {
      id: 4,
      name: "Student Affairs",
      email: "studentaffairs@ucc.edu.ph",
      number: "(02) 5310 1237",
      status: "Hidden",
      createdBy: "Administrator",
      createdAt: "Oct 04, 2026",
      updatedBy: "—"
    },
    {
      id: 5,
      name: "IT Services",
      email: "itservices@ucc.edu.ph",
      number: "(02) 5310 1238",
      status: "Active",
      createdBy: "Administrator",
      createdAt: "Oct 05, 2026",
      updatedBy: "—"
    }
  ];

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  // Escape text before inserting it into HTML.
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // Return today's date in a readable format.
  function today() {
    return new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  // Refresh Lucide icons after rendering dynamic HTML.
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Open or close a modal and manage page scrolling.
  function setOpen(modal, open) {
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));

    const anyModalOpen =
      formModal.classList.contains("is-open") ||
      previewModal.classList.contains("is-open");

    document.body.classList.toggle(
      "contact-modal-open",
      anyModalOpen
    );
  }

  // Return contacts matching the search query.
  function filtered() {
    const query = search.value.trim().toLowerCase();

    return contacts.filter(contact => {
      return [
        contact.name,
        contact.email,
        contact.number,
        contact.status
      ].some(value =>
        String(value).toLowerCase().includes(query)
      );
    });
  }

  // ==========================================
  // RENDER CONTACT TABLE
  // ==========================================

  function render() {
    const items = filtered();
    const visible = showAll
      ? items
      : items.slice(0, pageSize);

    const visibleIds = new Set(
      visible.map(contact => contact.id)
    );

    const existingIds = new Set();

    contacts.forEach(contact => {
      // Reuse the hardcoded HTML row when it already exists.
      let row = tbody.querySelector(
        `tr[data-id="${contact.id}"]`
      );

      // Create a row only if it does not already exist.
      if (!row) {
        row = document.createElement("tr");
        row.dataset.contactRow = "";
        row.dataset.id = String(contact.id);

        row.innerHTML = `
          <td>
            <div class="contact-name-cell">
              <strong></strong>
              <small></small>
            </div>
          </td>

          <td></td>
          <td></td>

          <td>
            <span class="contact-status"></span>
          </td>

          <td>
            <div class="contact-row-actions">
              <button
                class="contact-icon-btn view"
                type="button"
                data-action="preview"
                title="View contact"
                aria-label="View contact"
              >
                <i data-lucide="eye"></i>
              </button>

              <button
                class="contact-icon-btn edit"
                type="button"
                data-action="edit"
                title="Edit contact"
                aria-label="Edit contact"
              >
                <i data-lucide="pencil"></i>
              </button>

              <button
                class="contact-icon-btn delete"
                type="button"
                data-action="delete"
                title="Delete contact"
                aria-label="Delete contact"
              >
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        `;

        tbody.appendChild(row);
      }

      existingIds.add(contact.id);

      row.dataset.id = String(contact.id);

      // Update the row's text without replacing the hardcoded row.
      row.querySelector(
        ".contact-name-cell strong"
      ).textContent = contact.name;

      row.querySelector(
        ".contact-name-cell small"
      ).textContent = `Contact #${contact.id}`;

      row.cells[1].textContent = contact.email;
      row.cells[2].textContent = contact.number;

      const status = row.querySelector(
        ".contact-status"
      );

      status.textContent = contact.status;
      status.className =
        `contact-status ${contact.status.toLowerCase()}`;

      // Assign the correct contact ID to each action button.
      row.querySelectorAll("[data-action]").forEach(button => {
        button.dataset.id = String(contact.id);

        const actionName =
          button.dataset.action === "preview"
            ? "View"
            : button.dataset.action === "edit"
              ? "Edit"
              : "Delete";

        button.setAttribute(
          "aria-label",
          `${actionName} ${contact.name}`
        );
      });

      // Hide rows that do not match the search or current page.
      row.hidden = !visibleIds.has(contact.id);
    });

    // Remove rows belonging to deleted contacts.
    tbody.querySelectorAll("tr[data-id]").forEach(row => {
      if (!existingIds.has(Number(row.dataset.id))) {
        row.remove();
      }
    });

    // Update the empty state.
    $("contactEmptyState").hidden = items.length !== 0;

    // Update the contact count.
    $("contactCountLabel").textContent =
      `${items.length} Contact${items.length === 1 ? "" : "s"}`;

    // Update the message beneath the table.
    $("contactEndMessage").textContent =
      items.length === 0
        ? "— No items —"
        : visible.length >= items.length
          ? "— No more items —"
          : "";

    // Show pagination only when there are more than five contacts.
    $("showMoreContacts").hidden = items.length <= pageSize;

    $("showMoreContacts").textContent =
      showAll ? "Show less" : "Show more";

    refreshIcons();
  }

  // ==========================================
  // CONTACT FORM
  // ==========================================

  function clearForm() {
    form.reset();

    $("contactId").value = "";

    editingId = null;

    $("contactFormTitle").textContent = "Add Contact";
    $("saveContactLabel").textContent = "Save Contact";
    $("contactStatus").value = "Active";
  }

  function openForm(contact = null) {
    clearForm();

    if (contact) {
      editingId = contact.id;

      $("contactId").value = contact.id;
      $("contactName").value = contact.name;
      $("contactEmail").value = contact.email;
      $("contactNumber").value = contact.number;
      $("contactStatus").value = contact.status;

      $("contactFormTitle").textContent = "Edit Contact";
      $("saveContactLabel").textContent = "Save Changes";
    }

    setOpen(formModal, true);

    $("contactName").focus();
  }

  // ==========================================
  // CONTACT PREVIEW
  // ==========================================

  function openPreview(contact) {
    $("previewContactName").textContent =
      contact.name || "Contact name";

    $("previewContactEmail").textContent =
      contact.email || "No email provided";

    $("previewContactNumber").textContent =
      contact.number || "No number provided";

    const status = contact.status || "Active";
    const statusElement = $("previewContactStatus");

    statusElement.textContent = status;
    statusElement.className =
      `contact-status ${status.toLowerCase()}`;

    $("previewCreatedBy").textContent =
      contact.createdBy || "Administrator";

    $("previewCreatedAt").textContent =
      contact.createdAt || today();

    $("previewUpdatedBy").textContent =
      contact.updatedBy || "Not updated";

    refreshIcons();

    setOpen(previewModal, true);
  }

  // ==========================================
  // OPEN AND CLOSE MODALS
  // ==========================================

  $("openContactForm").addEventListener("click", () => {
    openForm();
  });

  document.querySelectorAll("[data-close-form]").forEach(button => {
    button.addEventListener("click", () => {
      setOpen(formModal, false);
      clearForm();
    });
  });

  document.querySelector("[data-close-preview]")
    .addEventListener("click", () => {
      setOpen(previewModal, false);
    });

  // Close a modal when the user clicks its overlay.
  [formModal, previewModal].forEach(modal => {
    modal.addEventListener("click", event => {
      if (event.target !== modal) return;

      setOpen(modal, false);

      if (modal === formModal) {
        clearForm();
      }
    });
  });

  // Close the active modal with Escape.
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (previewModal.classList.contains("is-open")) {
      setOpen(previewModal, false);
    } else if (formModal.classList.contains("is-open")) {
      setOpen(formModal, false);
      clearForm();
    }
  });

  // ==========================================
  // PREVIEW FORM DATA
  // ==========================================

  $("previewContactBtn").addEventListener("click", () => {
    if (!form.reportValidity()) return;

    const oldContact = editingId
      ? contacts.find(contact => contact.id === editingId)
      : null;

    openPreview({
      name: $("contactName").value.trim(),
      email: $("contactEmail").value.trim(),
      number: $("contactNumber").value.trim(),
      status: $("contactStatus").value,

      createdBy: oldContact?.createdBy || "Administrator",
      createdAt: oldContact?.createdAt || today(),

      updatedBy: oldContact
        ? "Administrator"
        : "Not updated"
    });
  });

  // ==========================================
  // ADD AND EDIT CONTACTS
  // ==========================================

  form.addEventListener("submit", event => {
    event.preventDefault();

    const oldContact = editingId
      ? contacts.find(contact => contact.id === editingId)
      : null;

    const contact = {
      id: editingId || nextId++,

      name: $("contactName").value.trim(),
      email: $("contactEmail").value.trim(),
      number: $("contactNumber").value.trim(),
      status: $("contactStatus").value,

      createdBy: oldContact?.createdBy || "Administrator",
      createdAt: oldContact?.createdAt || today(),

      updatedBy: oldContact
        ? "Administrator"
        : "—"
    };

    if (oldContact) {
      // Update an existing contact.
      contacts = contacts.map(existing =>
        existing.id === oldContact.id
          ? contact
          : existing
      );
    } else {
      
      contacts.unshift(contact);
    }

    // Reset the table view and search field.
    showAll = false;
    search.value = "";

    render();

    setOpen(formModal, false);
    clearForm();
  });

  // ==========================================
  // VIEW, EDIT, AND DELETE ACTIONS
  // ==========================================

 
  tbody.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const contactId = Number(button.dataset.id);

    const contact = contacts.find(item =>
      item.id === contactId
    );

    if (!contact) return;

    const action = button.dataset.action;

    // Preview contact details.
    if (action === "preview") {
      openPreview(contact);
      return;
    }

    // Open the form with the selected contact's details.
    if (action === "edit") {
      openForm(contact);
      return;
    }

    // Delete the selected contact after confirmation.
    if (action === "delete") {
      const confirmed = window.confirm(
        `Delete "${contact.name}"? This cannot be undone.`
      );

      if (!confirmed) return;

      contacts = contacts.filter(item =>
        item.id !== contact.id
      );

      render();
    }
  });

  // ==========================================
  // SEARCH
  // ==========================================

  search.addEventListener("input", () => {
    showAll = false;
    render();
  });

  // ==========================================
  // SHOW MORE / SHOW LESS
  // ==========================================

  $("showMoreContacts").addEventListener("click", () => {
    showAll = !showAll;
    render();
  });

 

  render();

})();
