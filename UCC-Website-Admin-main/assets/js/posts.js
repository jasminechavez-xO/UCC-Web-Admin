document.addEventListener("DOMContentLoaded", () => {
    
    const posts = [];
    let editingId = null;
    let nextId = 1;
    let currentImage = "";
    const $ = id => document.getElementById(id);
    const tableBody = $("postsTableBody"), search = $("postSearch"), filter = $("postFilter"), sort = $("postSort");
    const modal = $("postModal"), previewModal = $("postPreviewModal"), form = $("postForm"), file = $("featuredImage");
    const imagePreview = $("imagePreview"), placeholder = $("uploadPlaceholder"), removeImageBtn = $("removeImageBtn");
    const content = $("postContent"), toast = $("uiToast"), rowTemplate = $("postRowTemplate"), emptyRow = $("postsEmptyRow");
    const escapeHtml = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    const formatDate = date => date ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"}) : "Date not set";
    const rows = () => [...tableBody.querySelectorAll("tr[data-post-row]")];
    const rowFor = id => rows().find(row => Number(row.dataset.id) === Number(id));

    
    function updateRow(post, row = rowFor(post.id)) {
        if (!row) {
            row = rowTemplate.cloneNode(true);
            row.removeAttribute("id"); row.removeAttribute("aria-hidden"); row.classList.remove("post-row-template");
            row.dataset.postRow = "";
            rowTemplate.before(row);
        }
        row.dataset.id = post.id; row.dataset.status = post.status; row.dataset.title = post.title;
        row.dataset.category = post.category; row.dataset.date = post.date; row.dataset.excerpt = post.excerpt;
        row.dataset.content = post.content; row.dataset.image = post.image;
        row.dataset.createdAt = post.createdAt || String(post.id).padStart(12, "0");
        const cells = row.cells;
        const thumb = cells[0].querySelector(".featured-thumb");
        thumb.replaceChildren();
        if (post.image) {
            const img = document.createElement("img"); img.src = post.image; img.alt = ""; thumb.appendChild(img);
        } else {
            const icon = document.createElement("i"); icon.setAttribute("data-lucide", "image"); icon.setAttribute("aria-hidden", "true"); thumb.appendChild(icon);
        }
        const title = cells[1].querySelector(".cell-ellipsis"); title.textContent = post.title; title.title = post.title;
        const category = cells[2].querySelector(".cell-ellipsis"); category.textContent = post.category; category.title = post.category;
        const date = cells[3].querySelector(".cell-ellipsis"); date.textContent = formatDate(post.date); date.title = date.textContent;
        const badge = cells[4].querySelector(".status-badge"); badge.textContent = post.status; badge.className = "status-badge status-" + post.status.toLowerCase();
        cells[5].querySelector('[data-action="preview"]').setAttribute("aria-label", "Preview " + post.title);
        cells[5].querySelector('[data-action="edit"]').setAttribute("aria-label", "Edit " + post.title);
        lucide.createIcons();
        return row;
    }

    // Search, status filtering, and pagination.
    const pageSize = 10;
    let currentPage = 1;

    function renderPagination(totalPages) {
        const pagination = $("postsPagination");
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
                button.setAttribute("aria-label", label);
            } else button.textContent = label;
            button.disabled = Boolean(options.disabled);
            if (options.active) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }
            button.addEventListener("click", () => {
                currentPage = page;
                applyFilters();
            });
            pagination.appendChild(button);
        };

        addButton("", Math.max(1, currentPage - 1), {disabled: currentPage === 1, icon: "chevron-left"});
        for (let page = 1; page <= totalPages; page++) {
            addButton(String(page), page, {active: page === currentPage});
        }
        addButton("", Math.min(totalPages, currentPage + 1), {disabled: currentPage === totalPages, icon: "chevron-right"});
        lucide.createIcons();
    }

    function applyFilters() {
        const query = search.value.trim().toLowerCase(), selectedStatus = filter.value;
        const sortMode = sort ? sort.value : "created-desc";
        const matchingRows = rows().filter(row => {
            const matchesText = (row.dataset.title + " " + row.dataset.category + " " + row.dataset.excerpt).toLowerCase().includes(query);
            const matchesStatus = selectedStatus === "All" || row.dataset.status === selectedStatus;
            return matchesText && matchesStatus;
        });
        matchingRows.sort((a, b) => {
            if (sortMode === "created-asc") return a.dataset.createdAt.localeCompare(b.dataset.createdAt);
            if (sortMode === "date-desc") return (b.dataset.date || "").localeCompare(a.dataset.date || "");
            if (sortMode === "date-asc") return (a.dataset.date || "").localeCompare(b.dataset.date || "");
            if (sortMode === "title-asc") return a.dataset.title.localeCompare(b.dataset.title);
            if (sortMode === "title-desc") return b.dataset.title.localeCompare(a.dataset.title);
            return b.dataset.createdAt.localeCompare(a.dataset.createdAt);
        });
        const totalPages = Math.max(1, Math.ceil(matchingRows.length / pageSize));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * pageSize;
        const pageRows = new Set(matchingRows.slice(start, start + pageSize));
        rows().forEach(row => { row.hidden = !pageRows.has(row); });
        $("postsCount").textContent = `${matchingRows.length} ${matchingRows.length === 1 ? "post" : "posts"}`;
        emptyRow.hidden = matchingRows.length !== 0;
        const endMessage = $("postsEndMessage");
        if (endMessage) {
            endMessage.hidden = matchingRows.length === 0 || currentPage !== totalPages;
        }
        renderPagination(totalPages);
    }

    // Image preview helper.
    function setImage(src) {
        currentImage = src || "";
        if (currentImage) {
            imagePreview.src = currentImage; imagePreview.hidden = false; imagePreview.style.display = "block";
            placeholder.hidden = true; placeholder.style.display = "none"; removeImageBtn.hidden = false;
        } else {
            imagePreview.removeAttribute("src"); imagePreview.hidden = true; imagePreview.style.display = "none";
            placeholder.hidden = false; placeholder.style.display = "flex"; removeImageBtn.hidden = true;
        }
    }

    // Open the add/edit modal.
    function openPostModal(post = null) {
        editingId = post ? post.id : null;
        $("postFormTitle").textContent = post ? "Edit Post" : "Add New Post";
        $("postFormDescription").textContent = post ? "Update the post details below." : "Create a post for the university website.";
        $("postTitle").value = post?.title || "";
        $("postExcerpt").value = post?.excerpt || "";
        $("postCategory").value = post?.category || "News";
        $("postDate").value = post?.date || "";
        $("postStatus").value = post?.status || "Draft";
        setImage(post?.image || "");
        modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
        lucide.createIcons(); $("postTitle").focus();
    }
    function closePostModal() {
        modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
        editingId = null; form.reset(); content.value = ""; setImage(""); file.value = "";
    }


    function openPreview(post) {
        $("previewCategory").textContent = post.category || "News";
        $("previewTitle").textContent = post.title || "Untitled Post";
        $("previewDate").textContent = formatDate(post.date);
        $("previewStatus").textContent = post.status || "Draft";
        $("previewMetaCategory").textContent = post.category || "News";
        $("previewMetaDate").textContent = formatDate(post.date);
        $("previewExcerpt").textContent = post.excerpt || "";
        $("previewContent").textContent = post.content || "";
        const image = $("previewImage"), defaultImage = previewModal.querySelector(".preview-default-image");
        if (post.image) { image.src = post.image; image.hidden = false; defaultImage.hidden = true; }
        else { image.removeAttribute("src"); image.hidden = true; defaultImage.hidden = false; }
        previewModal.classList.add("open"); previewModal.setAttribute("aria-hidden", "false");
        lucide.createIcons();
    }
    function closePreview() { previewModal.classList.remove("open"); previewModal.setAttribute("aria-hidden", "true"); }
    function notify(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove("show"), 2400); }

    // Validate required fields before saving a post.
    function collectFormData(status) {
        const title = $("postTitle").value.trim(), excerpt = $("postExcerpt").value.trim();
        if (!title) { $("postTitle").focus(); $("postTitle").reportValidity(); return null; }
        if (!excerpt) { $("postExcerpt").focus(); $("postExcerpt").reportValidity(); return null; }
        const bodyText = content.value.trim();
        if (!bodyText) { content.focus(); content.reportValidity(); return null; }
        return {title, excerpt, category:$("postCategory").value, date:$("postDate").value, status:$("postStatus").value, image:currentImage, content:bodyText};
    }
    function savePost(status) {
        const data = collectFormData(status); if (!data) return;
        if (editingId !== null) {
            const post = posts.find(item => item.id === editingId); if (!post) return;
            Object.assign(post, data); updateRow(post);
        } else {
            const post = {id:nextId++, createdAt:String(Date.now()).padStart(16, "0"), ...data}; posts.unshift(post); updateRow(post, null);
        }
        currentPage = 1;
        applyFilters(); closePostModal();
    }

    // Toolbar and table actions
    $("addPostBtn").addEventListener("click", () => openPostModal());
    search.addEventListener("input", () => { currentPage = 1; applyFilters(); });
    filter.addEventListener("change", () => { currentPage = 1; applyFilters(); });
    if (sort) sort.addEventListener("change", () => { currentPage = 1; applyFilters(); });
    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-action]"); if (!button || button.closest("#postRowTemplate")) return;
        const row = button.closest("tr[data-post-row]"), post = row && posts.find(item => item.id === Number(row.dataset.id));
        if (!post) return;
        if (button.dataset.action === "edit") openPostModal(post);
        if (button.dataset.action === "preview") openPreview(post);
        if (button.dataset.action === "archive") {
            if (post.status === "Archived") { notify("This post is already archived."); return; }
            post.status = "Archived";
            updateRow(post, row);
            currentPage = 1;
            applyFilters();

        }
    });

    // Modal open/close
    document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closePostModal));
    document.querySelectorAll("[data-close-preview]").forEach(button => button.addEventListener("click", closePreview));
    form.addEventListener("submit", event => { event.preventDefault(); savePost($("postStatus").value); });
    $("formPreviewBtn").addEventListener("click", () => {
        const draft = {title:$("postTitle").value.trim(), excerpt:$("postExcerpt").value.trim(), category:$("postCategory").value, date:$("postDate").value, image:currentImage, content:content.value};
        openPreview(draft);
    });
    $("uploadImageBtn").addEventListener("click", () => file.click());
    $("removeImageBtn").addEventListener("click", () => { setImage(""); file.value = ""; });
    file.addEventListener("change", () => {
        const selectedFile = file.files && file.files[0]; if (!selectedFile) return;
        if (!selectedFile.type.startsWith("image/")) { notify("Please choose an image file."); file.value = ""; return; }
        const reader = new FileReader(); reader.onload = event => setImage(event.target.result); reader.readAsDataURL(selectedFile);
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") { if (previewModal.classList.contains("open")) closePreview(); else if (modal.classList.contains("open")) closePostModal(); }
    });

    
    posts.forEach(post => updateRow(post));
    applyFilters();
});