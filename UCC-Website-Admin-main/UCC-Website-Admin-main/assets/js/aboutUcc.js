
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const tbody = $("postsTableBody");
  const formOverlay = $("postFormOverlay");
  const previewOverlay = $("postPreviewOverlay");
  const form = $("postForm");
  const search = $("aboutSearch");
  const filter = $("statusFilter");
  const showMoreBtn = $("showMoreBtn");
  const noMoreItems = $("noMoreItems");

  const PAGE_SIZE = 5;

  let showAll = false;
  let nextId = 6;
  let currentImage = "";

  // ============================================
  // DATE
  // ============================================

  const nowDate = () =>
    new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

  // ============================================
  // INITIAL POSTS
  // ============================================

  const posts = [
    {
      id: 1,
      image: "assets/images/about-ucc.jpg",
      name: "About University of Caloocan City",
      description:
        "Learn about UCC, its history, mission, and commitment to quality education.",
      status: "Active",
      createdBy: "Admin",
      createdDate: "Oct 1, 2025",
      updatedBy: "Admin"
    },
    {
      id: 2,
      image: "assets/images/about-ucc-campus.jpg",
      name: "Our History",
      description:
        "Discover the milestones and growth that shaped the university.",
      status: "Active",
      createdBy: "Admin",
      createdDate: "Oct 2, 2025",
      updatedBy: "Admin"
    },
    {
      id: 3,
      image: "assets/images/about-ucc-mission.jpg",
      name: "Mission and Vision",
      description:
        "Read the university's mission, vision, and guiding values.",
      status: "Hidden",
      createdBy: "Admin",
      createdDate: "Oct 3, 2025",
      updatedBy: "—"
    },
    {
      id: 4,
      image: "assets/images/about-ucc-community.jpg",
      name: "Our Community",
      description:
        "Meet the students, faculty, and community that make UCC unique.",
      status: "Active",
      createdBy: "Admin",
      createdDate: "Oct 4, 2025",
      updatedBy: "Admin"
    },
    {
      id: 5,
      image: "assets/images/about-ucc-programs.jpg",
      name: "Academic Excellence",
      description:
        "An overview of UCC's academic offerings and learning environment.",
      status: "Hidden",
      createdBy: "Admin",
      createdDate: "Oct 5, 2025",
      updatedBy: "—"
    }
  ];

  // ============================================
  // HELPERS
  // ============================================

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character]));

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function openOverlay(overlay) {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeOverlay(overlay) {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".about-modal-overlay.is-open")) {
      document.body.style.overflow = "";
    }
  }

  // ============================================
  // SEARCH AND STATUS FILTER
  // ============================================

  function filteredPosts() {
    const query = search.value.trim().toLowerCase();
    const selectedStatus = filter.value;

    return posts.filter((post) => {
      const matchesStatus =
        selectedStatus === "all" ||
        post.status === selectedStatus;

      const searchableText = [
        post.name,
        post.description,
        post.status
      ].join(" ").toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(query)
      );
    });
  }

  // ============================================
  // RENDER TABLE
  // ============================================

  function render() {
    const list = filteredPosts();

    const visiblePosts = showAll
      ? list
      : list.slice(0, PAGE_SIZE);

    tbody.innerHTML = visiblePosts.map((post) => `
      <tr
        data-id="${post.id}"
        data-status="${escapeHtml(post.status)}"
      >
        <td>
          ${
            post.image
              ? `
                <img
                  class="table-featured-image"
                  src="${escapeHtml(post.image)}"
                  alt="${escapeHtml(post.name)} featured image"
                  onerror="this.style.display='none'"
                >
              `
              : `
                <span class="no-image-label">
                  No image
                </span>
              `
          }
        </td>

        <td class="table-post-name">
          ${escapeHtml(post.name)}
        </td>

        <td class="table-post-description">
          ${escapeHtml(post.description)}
        </td>

        <td>
          <span class="about-status ${post.status.toLowerCase()}">
            ${escapeHtml(post.status)}
          </span>
        </td>

        <td>
          <div class="about-row-actions">
            <button
              class="about-icon-btn view"
              type="button"
              data-action="preview"
              aria-label="Preview post"
              title="Preview"
            >
              <i data-lucide="eye"></i>
            </button>

            <button
              class="about-icon-btn edit"
              type="button"
              data-action="edit"
              aria-label="Edit post"
              title="Edit"
            >
              <i data-lucide="pencil"></i>
            </button>

            <button
              class="about-icon-btn delete"
              type="button"
              data-action="delete"
              aria-label="Delete post"
              title="Delete"
            >
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    $("postCount").textContent =
      `${list.length} ${list.length === 1 ? "post" : "posts"}`;

    showMoreBtn.hidden = list.length <= PAGE_SIZE;

    showMoreBtn.textContent = showAll
      ? "Show less"
      : "Show more";

    noMoreItems.hidden =
      list.length > PAGE_SIZE && !showAll;

    refreshIcons();
  }

  // ============================================
  // FEATURED IMAGE DISPLAY
  // ============================================

  function updateImagePreview() {
    const image = $("selectedImagePreview");
    const chooseButton = $("chooseImageBtn");
    const removeButton = $("removeImageBtn");
    const emptyLabel = document.querySelector(".image-upload-empty");

    if (currentImage) {
      image.src = currentImage;
      image.hidden = false;

      // Choose Photo stays visible on the right.
      chooseButton.hidden = false;

      // Show Remove Photo only when an image is selected.
      removeButton.hidden = false;

      if (emptyLabel) {
        emptyLabel.hidden = true;
      }
    } else {
      image.removeAttribute("src");
      image.hidden = true;

      // Choose Photo is the only visible button initially.
      chooseButton.hidden = false;
      removeButton.hidden = true;

      if (emptyLabel) {
        emptyLabel.hidden = false;
      }
    }

    refreshIcons();
  }

  function removeImage() {
    currentImage = "";

    $("featuredImage").value = "";
   

    updateImagePreview();
  }

  // ============================================
  // CLEAR FORM
  // ============================================

  function clearForm() {
    form.reset();

    $("postId").value = "";

    currentImage = "";

    $("formModalTitle").textContent = "Add Post";

    $("formModalSubtitle").textContent =
      "Add a new About UCC post and manage how it appears on the website.";

    $("savePostLabel").textContent = "Save Post";

    updateImagePreview();
  }

  // ============================================
  // OPEN ADD / EDIT FORM
  // ============================================

  function openForm(post = null) {
    clearForm();

    if (post) {
      $("postId").value = post.id;

      $("formModalTitle").textContent = "Edit Post";

      $("formModalSubtitle").textContent =
        "Update the post details, featured image, and visibility status.";

      $("savePostLabel").textContent = "Save Changes";

      $("postName").value = post.name;
      $("postDescription").value = post.description;
      $("postStatus").value = post.status;

      currentImage = post.image || "";

      updateImagePreview();
    }

    openOverlay(formOverlay);
    $("postName").focus();
  }

  // ============================================
  // PREVIEW METADATA
  // ============================================

  function updateMetadata(post) {
    $("metadataCreatedBy").textContent =
      post.createdBy || "Admin";

    $("metadataCreatedDate").textContent =
      post.createdDate || "—";

    $("metadataUpdatedBy").textContent =
      post.updatedBy || "—";
  }

  // ============================================
  // POST PREVIEW
  // ============================================

  function openPreview(post, fromForm = false) {
    let previewPost = post;

    if (fromForm) {
      const existingId = Number($("postId").value);

      const existing = posts.find(
        (item) => item.id === existingId
      );

      previewPost = {
        image: currentImage,

        name:
          $("postName").value.trim() ||
          "Post name",

        description:
          $("postDescription").value.trim() ||
          "Post description will appear here.",

        status: $("postStatus").value,

        createdBy: existing?.createdBy || "Admin",

        createdDate:
          existing?.createdDate || nowDate(),

        updatedBy: existing ? "Admin" : "—"
      };
    }

    // Preview title should be in the HTML heading:
    // "About UCC Post Preview"
    $("previewName").textContent = previewPost.name;

    $("previewDescription").textContent =
      previewPost.description;

    $("previewStatus").textContent =
      previewPost.status;

    $("previewStatus").className =
      `about-status ${previewPost.status.toLowerCase()}`;

    const previewImage = $("previewImage");

    if (previewPost.image) {
      previewImage.src = previewPost.image;
      previewImage.hidden = false;
    } else {
      previewImage.removeAttribute("src");
      previewImage.hidden = true;
    }

    // Metadata is displayed inside the preview modal.
    updateMetadata(previewPost);

    openOverlay(previewOverlay);
    refreshIcons();
  }

  // ============================================
  // ADD POST BUTTON
  // ============================================

  $("addPostBtn").addEventListener("click", () => {
    openForm();
  });

  // ============================================
  // CLOSE FORM
  // ============================================

  document.querySelectorAll("[data-close-form]").forEach((button) => {
    button.addEventListener("click", () => {
      closeOverlay(formOverlay);
    });
  });

  // ============================================
  // CLOSE PREVIEW USING X BUTTON
  // ============================================

  document.querySelectorAll("[data-close-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      closeOverlay(previewOverlay);
    });
  });

  // ============================================
  // CHOOSE PHOTO BUTTON
  // ============================================

  $("chooseImageBtn").addEventListener("click", () => {
    $("featuredImage").click();
  });

  // ============================================
  // REMOVE PHOTO BUTTON
  // ============================================

  $("removeImageBtn").addEventListener("click", () => {
    removeImage();
  });

  // ============================================
  // IMAGE FILE UPLOAD
  // ============================================

  $("featuredImage").addEventListener("change", (event) => {
    const file =
      event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      currentImage = String(reader.result);

      

      updateImagePreview();
    };

    reader.readAsDataURL(file);
  });

  

  // ============================================
  // PREVIEW FROM FORM
  // ============================================

  $("formPreviewBtn").addEventListener("click", () => {
    openPreview({}, true);
  });

  // ============================================
  // SAVE POST
  // ============================================

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = Number($("postId").value);

    const existing = posts.find(
      (post) => post.id === id
    );

    const name = $("postName").value.trim();

    const description =
      $("postDescription").value.trim();

    if (!name || !description) {
      form.reportValidity();
      return;
    }

    const post = {
      id: existing ? existing.id : nextId++,

      image: currentImage,

      name,

      description,

      status: $("postStatus").value,

      createdBy: existing?.createdBy || "Admin",

      createdDate:
        existing?.createdDate || nowDate(),

      updatedBy: "Admin"
    };

    if (existing) {
      Object.assign(existing, post);
    } else {
      posts.unshift(post);
    }

    showAll = true;

    render();

    closeOverlay(formOverlay);

    clearForm();
  });

  // ============================================
  // TABLE ACTIONS
  // ============================================

  tbody.addEventListener("click", (event) => {
    const button = event.target.closest(
      "button[data-action]"
    );

    if (!button) {
      return;
    }

    const row = button.closest("tr");

    const post = posts.find(
      (item) => item.id === Number(row?.dataset.id)
    );

    if (!post) {
      return;
    }

    const action = button.dataset.action;

    if (action === "preview") {
      openPreview(post);
    }

    if (action === "edit") {
      openForm(post);
    }

    if (
      action === "delete" &&
      confirm(`Delete "${post.name}"?`)
    ) {
      posts.splice(posts.indexOf(post), 1);
      render();
    }
  });

  // ============================================
  // SEARCH
  // ============================================

  search.addEventListener("input", () => {
    showAll = false;
    render();
  });

  // ============================================
  // STATUS FILTER
  // ============================================

  filter.addEventListener("change", () => {
    showAll = false;
    render();
  });

  // ============================================
  // SHOW MORE / SHOW LESS
  // ============================================

  showMoreBtn.addEventListener("click", () => {
    showAll = !showAll;
    render();
  });

  // ============================================
  // CLOSE OVERLAY WHEN CLICKING OUTSIDE
  // ============================================

  [formOverlay, previewOverlay].forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeOverlay(overlay);
      }
    });
  });

  // ============================================
  // ESCAPE KEY CLOSES OPEN MODAL
  // ============================================

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (previewOverlay.classList.contains("is-open")) {
      closeOverlay(previewOverlay);
    } else if (formOverlay.classList.contains("is-open")) {
      closeOverlay(formOverlay);
    }
  });

  // ============================================
  // INITIALIZE PAGE
  // ============================================

  render();
  updateImagePreview();
})();
