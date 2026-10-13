
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const posts = [];
    let editingId = null;
    let nextId = 1;
    let currentImage = "";
    let showingAll = false;

    const pageSize = 5;
    const currentAdmin = "Admin";
    const $ = id => document.getElementById(id);

    const tableBody = $("postsTableBody");
    const search = $("postSearch");
    const filter = $("postFilter");
    const sort = $("postSort");
    const modal = $("postModal");
    const previewModal = $("postPreviewModal");
    const form = $("postForm");
    const file = $("featuredImage");
    const imagePreview = $("imagePreview");
    const placeholder = $("uploadPlaceholder");
    const removeImageBtn = $("removeImageBtn");
    const content = $("postContent");
    const toast = $("uiToast");
    const rowTemplate = $("postRowTemplate");
    const emptyRow = $("postsEmptyRow");
    const showMoreBtn = $("showMorePostsBtn");
    const endMessage = $("postsEndMessage");

    const formatDate = date => {
        if (!date) return "Date not set";

        const parsed = new Date(date);

        return Number.isNaN(parsed.getTime())
            ? date
            : parsed.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
    };

    const formatTimestamp = value => {
        if (!value) return "—";

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) return "—";

        return parsed.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    const rows = () =>
        [...tableBody.querySelectorAll("tr[data-post-row]")];

    const rowFor = id =>
        rows().find(row => Number(row.dataset.id) === Number(id));

    function notify(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(notify.timer);

        notify.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2400);
    }

    // Metadata appears only in the Add/Edit Post modal.
    function updateAuditMetadata(post = null) {
        if ($("metadataCreatedBy")) {
            $("metadataCreatedBy").textContent =
                post?.createdBy || "Will be set when saved";
        }

        if ($("metadataCreatedDate")) {
            $("metadataCreatedDate").textContent = post
                ? formatTimestamp(post.createdAt)
                : "Will be set when saved";
        }

        if ($("metadataUpdatedBy")) {
            $("metadataUpdatedBy").textContent =
                post?.updatedBy || "Not updated yet";
        }
    }

    function updateRow(post, row = rowFor(post.id)) {
        if (!row) {
            row = rowTemplate.cloneNode(true);

            row.removeAttribute("id");
            row.removeAttribute("aria-hidden");
            row.classList.remove("post-row-template");
            row.dataset.postRow = "";

            rowTemplate.before(row);
        }

        row.dataset.id = post.id;
        row.dataset.status = post.status;
        row.dataset.title = post.title;
        row.dataset.category = post.category;
        row.dataset.date = post.date || "";
        row.dataset.excerpt = post.excerpt;
        row.dataset.createdAt = post.createdAt || "";

        const cells = row.cells;
        const thumb = cells[0].querySelector(".featured-thumb");

        thumb.replaceChildren();

        if (post.image) {
            const img = document.createElement("img");
            img.src = post.image;
            img.alt = "";
            thumb.appendChild(img);
        } else {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "image");
            icon.setAttribute("aria-hidden", "true");
            thumb.appendChild(icon);
        }

        const title = cells[1].querySelector(".cell-ellipsis");
        title.textContent = post.title;
        title.title = post.title;

        const category = cells[2].querySelector(".cell-ellipsis");
        category.textContent = post.category;
        category.title = post.category;

        const date = cells[3].querySelector(".cell-ellipsis");
        date.textContent = formatDate(post.date);
        date.title = date.textContent;

        const badge = cells[4].querySelector(".status-badge");
        badge.textContent = post.status;
        badge.className =
            "status-badge status-" + post.status.toLowerCase();

        cells[5]
            .querySelector('[data-action="preview"]')
            .setAttribute("aria-label", "Preview " + post.title);

        cells[5]
            .querySelector('[data-action="edit"]')
            .setAttribute("aria-label", "Edit " + post.title);

        cells[5]
            .querySelector('[data-action="archive"]')
            .setAttribute("aria-label", "Archive " + post.title);

        if (window.lucide) {
            window.lucide.createIcons();
        }

        return row;
    }

    // Show More / Show Less / No More Items footer.
    function renderListControls(total) {
        if (showMoreBtn) {
            const hasMore = total > pageSize;

            showMoreBtn.hidden = !hasMore;
            showMoreBtn.textContent = showingAll
                ? "Show less"
                : "Show more";

            showMoreBtn.setAttribute(
                "aria-expanded",
                String(showingAll)
            );
        }

        if (endMessage) {
            const hasNoResults = total === 0;
            const hasMoreToShow = total > pageSize && !showingAll;

            endMessage.hidden = hasNoResults || hasMoreToShow;
            endMessage.textContent = "-- No more items --";
        }
    }

    function applyFilters() {
        const query = search ? search.value.trim().toLowerCase() : "";
        const selectedStatus = filter ? filter.value : "All";
        const sortMode = sort ? sort.value : "created-desc";

        const matchingRows = rows().filter(row => {
            const postText = [
                row.dataset.title,
                row.dataset.category,
                row.dataset.excerpt
            ].join(" ").toLowerCase();

            return postText.includes(query) &&
                (selectedStatus === "All" ||
                    row.dataset.status === selectedStatus);
        });

        matchingRows.sort((a, b) => {
            if (sortMode === "created-asc") {
                return (a.dataset.createdAt || "")
                    .localeCompare(b.dataset.createdAt || "");
            }

            if (sortMode === "date-desc") {
                return (b.dataset.date || "")
                    .localeCompare(a.dataset.date || "");
            }

            if (sortMode === "date-asc") {
                return (a.dataset.date || "")
                    .localeCompare(b.dataset.date || "");
            }

            if (sortMode === "title-asc") {
                return (a.dataset.title || "")
                    .localeCompare(b.dataset.title || "");
            }

            if (sortMode === "title-desc") {
                return (b.dataset.title || "")
                    .localeCompare(a.dataset.title || "");
            }

            return (b.dataset.createdAt || "")
                .localeCompare(a.dataset.createdAt || "");
        });

        const visibleLimit = showingAll
            ? matchingRows.length
            : pageSize;

        const visibleRows = new Set(
            matchingRows.slice(0, visibleLimit)
        );

        rows().forEach(row => {
            row.hidden = !visibleRows.has(row);
        });

        if ($("postsCount")) {
            $("postsCount").textContent =
                `${matchingRows.length} ${
                    matchingRows.length === 1 ? "post" : "posts"
                }`;
        }

        if (emptyRow) {
            emptyRow.hidden = matchingRows.length !== 0;
        }

        renderListControls(matchingRows.length);
    }

    function setImage(src) {
        currentImage = src || "";

        if (currentImage) {
            imagePreview.src = currentImage;
            imagePreview.hidden = false;
            imagePreview.style.display = "block";

            placeholder.hidden = true;
            placeholder.style.display = "none";

            removeImageBtn.hidden = false;
        } else {
            imagePreview.removeAttribute("src");
            imagePreview.hidden = true;
            imagePreview.style.display = "none";

            placeholder.hidden = false;
            placeholder.style.display = "flex";

            removeImageBtn.hidden = true;
        }
    }

    function openPostModal(post = null) {
        editingId = post ? post.id : null;

        form.reset();

        $("postFormTitle").textContent =
            post ? "Edit Post" : "Add New Post";

        $("postFormDescription").textContent = post
            ? "Update the post details below."
            : "Create a post for the university website.";

        $("postTitle").value = post?.title || "";
        $("postExcerpt").value = post?.excerpt || "";
        $("postCategory").value = post?.category || "News";
        $("postDate").value = post?.date || "";
        $("postStatus").value = post?.status || "Draft";
        content.value = post?.content || "";

        setImage(post?.image || "");
        updateAuditMetadata(post);

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");

        if (window.lucide) {
            window.lucide.createIcons();
        }

        $("postTitle").focus();
    }

    function closePostModal() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");

        editingId = null;
        form.reset();
        content.value = "";

        setImage("");
    }

    // Preview contains post content only, without audit metadata.
    function openPreview(post) {
        $("previewCategory").textContent = post.category || "News";
        $("previewTitle").textContent = post.title || "Untitled Post";
        $("previewDate").textContent = formatDate(post.date);
        $("previewExcerpt").textContent = post.excerpt || "";
        $("previewContent").textContent = post.content || "";

        const image = $("previewImage");
        const defaultImage =
            previewModal.querySelector(".preview-default-image");

        if (post.image) {
            image.src = post.image;
            image.hidden = false;
            defaultImage.hidden = true;
        } else {
            image.removeAttribute("src");
            image.hidden = true;
            defaultImage.hidden = false;
        }

        previewModal.classList.add("open");
        previewModal.setAttribute("aria-hidden", "false");

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function closePreview() {
        previewModal.classList.remove("open");
        previewModal.setAttribute("aria-hidden", "true");
    }

    function collectFormData() {
        const title = $("postTitle").value.trim();
        const excerpt = $("postExcerpt").value.trim();
        const bodyText = content.value.trim();

        if (!title) {
            $("postTitle").focus();
            $("postTitle").reportValidity();
            return null;
        }

        if (!excerpt) {
            $("postExcerpt").focus();
            $("postExcerpt").reportValidity();
            return null;
        }

        if (!bodyText) {
            content.focus();
            content.reportValidity();
            return null;
        }

        return {
            title,
            excerpt,
            category: $("postCategory").value,
            date: $("postDate").value,
            status: $("postStatus").value,
            image: currentImage,
            content: bodyText
        };
    }

    function savePost() {
        const data = collectFormData();

        if (!data) return;

        const now = new Date().toISOString();

        if (editingId !== null) {
            const post = posts.find(item => item.id === editingId);

            if (!post) return;

            Object.assign(post, data, {
                updatedBy: currentAdmin,
                updatedAt: now
            });

            const row = updateRow(post);
            row.dataset.createdAt = post.createdAt;

            notify("Post updated successfully.");
        } else {
            const post = {
                id: nextId++,
                createdAt: now,
                createdBy: currentAdmin,
                updatedBy: "—",
                updatedAt: "",
                ...data
            };

            posts.unshift(post);

            const row = updateRow(post, null);
            row.dataset.createdAt = post.createdAt;

            notify("Post saved successfully.");
        }

        showingAll = false;
        applyFilters();
        closePostModal();
    }

    $("addPostBtn").addEventListener("click", () => {
        openPostModal();
    });

    if (search) {
        search.addEventListener("input", () => {
            showingAll = false;
            applyFilters();
        });
    }

    if (filter) {
        filter.addEventListener("change", () => {
            showingAll = false;
            applyFilters();
        });
    }

    if (sort) {
        sort.addEventListener("change", applyFilters);
    }

    if (showMoreBtn) {
        showMoreBtn.addEventListener("click", () => {
            showingAll = !showingAll;
            applyFilters();
        });
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");

        if (!button || button.closest("#postRowTemplate")) return;

        const row = button.closest("tr[data-post-row]");
        const post = row &&
            posts.find(item => item.id === Number(row.dataset.id));

        if (!post) return;

        if (button.dataset.action === "edit") {
            openPostModal(post);
        }

        if (button.dataset.action === "preview") {
            openPreview(post);
        }

        if (button.dataset.action === "archive") {
            if (confirm(
                `Archive "${post.title}"? This will remove it from the Posts table.`
            )) {
                const index = posts.findIndex(
                    item => item.id === post.id
                );

                if (index !== -1) {
                    posts.splice(index, 1);
                }

                row.remove();
                showingAll = false;
                applyFilters();

                notify("Post archived and removed from the Posts table.");
            }
        }
    });

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", closePostModal);
    });

    document.querySelectorAll("[data-close-preview]").forEach(button => {
        button.addEventListener("click", closePreview);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        savePost();
    });

    $("formPreviewBtn").addEventListener("click", () => {
        const draft = {
            title: $("postTitle").value.trim(),
            excerpt: $("postExcerpt").value.trim(),
            category: $("postCategory").value,
            date: $("postDate").value,
            status: $("postStatus").value,
            image: currentImage,
            content: content.value
        };

        openPreview(draft);
    });

    $("uploadImageBtn").addEventListener("click", () => {
        file.click();
    });

    $("removeImageBtn").addEventListener("click", () => {
        setImage("");
        file.value = "";
    });

    file.addEventListener("change", () => {
        const selectedFile = file.files && file.files[0];

        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            notify("Please choose an image file.");
            file.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = event => {
            setImage(event.target.result);
        };

        reader.readAsDataURL(selectedFile);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (previewModal.classList.contains("open")) {
                closePreview();
            } else if (modal.classList.contains("open")) {
                closePostModal();
            }
        }
    });

   
    applyFilters();
});
