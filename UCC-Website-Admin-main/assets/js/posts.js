document.addEventListener("DOMContentLoaded", () => {
    
    const posts = [
        {id:1,title:"University of Caloocan City News",category:"News",date:"2026-10-10",status:"Published",image:"",excerpt:"Latest news and updates from the University of Caloocan City.",content:"<p>Latest news and updates from the University of Caloocan City.</p>"},
        {id:2,title:"Important University Announcement",category:"Announcement",date:"2026-10-08",status:"Published",image:"",excerpt:"An important announcement for the UCC community.",content:"<p>An important announcement for the UCC community.</p>"},
        {id:3,title:"Upcoming University Event",category:"Event",date:"2026-10-20",status:"Pending",image:"",excerpt:"Details about an upcoming university event.",content:"<p>Details about an upcoming university event.</p>"},
        {id:4,title:"Student Activities Update",category:"News",date:"2026-10-05",status:"Draft",image:"",excerpt:"A draft update about student activities.",content:"<p>A draft update about student activities.</p>"}
    ];
    let editingId = null;
    let nextId = 5;
    let currentImage = "";
    const $ = id => document.getElementById(id);
    const tableBody = $("postsTableBody"), search = $("postSearch"), filter = $("postFilter");
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

    // Search and status filtering.
    function applyFilters() {
        const query = search.value.trim().toLowerCase(), selectedStatus = filter.value;
        let visible = 0;
        rows().forEach(row => {
            const matchesText = (row.dataset.title + " " + row.dataset.category + " " + row.dataset.excerpt).toLowerCase().includes(query);
            const matchesStatus = selectedStatus === "All" || row.dataset.status === selectedStatus;
            row.hidden = !(matchesText && matchesStatus);
            if (!row.hidden) visible++;
        });
        $("postsCount").textContent = `${visible} ${visible === 1 ? "post" : "posts"}`;
        emptyRow.hidden = visible !== 0;
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
        $("saveDraftBtn").hidden = Boolean(post);
        $("publishBtn").hidden = Boolean(post);
        $("saveChangesBtn").hidden = !post;
        modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
        lucide.createIcons(); $("postTitle").focus();
    }
    function closePostModal() {
        modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
        editingId = null; form.reset(); content.innerHTML = "<p>Write your post content here...</p>"; setImage(""); file.value = "";
    }


    function openPreview(post) {
        $("previewCategory").textContent = post.category || "News";
        $("previewTitle").textContent = post.title || "Untitled Post";
        $("previewDate").textContent = formatDate(post.date);
        $("previewExcerpt").textContent = post.excerpt || "";
        $("previewContent").innerHTML = post.content || "";
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
        const bodyText = content.innerText.trim();
        if (!bodyText) { notify("Please enter post content before saving."); content.focus(); return null; }
        return {title, excerpt, category:$("postCategory").value, date:$("postDate").value, status, image:currentImage, content:content.innerHTML};
    }
    function savePost(status) {
        const data = collectFormData(status); if (!data) return;
        if (editingId !== null) {
            const post = posts.find(item => item.id === editingId); if (!post) return;
            Object.assign(post, data); updateRow(post); notify("Post changes saved.");
        } else {
            const post = {id:nextId++, ...data}; posts.unshift(post); updateRow(post, null); notify(status === "Published" ? "Post published." : "Post saved as draft.");
        }
        applyFilters(); closePostModal();
    }

    // Toolbar and table actions
    $("addPostBtn").addEventListener("click", () => openPostModal());
    search.addEventListener("input", applyFilters); filter.addEventListener("change", applyFilters);
    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-action]"); if (!button || button.closest("#postRowTemplate")) return;
        const row = button.closest("tr[data-post-row]"), post = row && posts.find(item => item.id === Number(row.dataset.id));
        if (!post) return;
        if (button.dataset.action === "edit") openPostModal(post);
        if (button.dataset.action === "preview") openPreview(post);
    });

    // Modal open/close
    document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closePostModal));
    document.querySelectorAll("[data-close-preview]").forEach(button => button.addEventListener("click", closePreview));
    $("saveDraftBtn").addEventListener("click", () => savePost("Draft"));
    $("saveChangesBtn").addEventListener("click", () => savePost($("postStatus").value));
    form.addEventListener("submit", event => { event.preventDefault(); savePost("Published"); });
    $("formPreviewBtn").addEventListener("click", () => {
        const draft = {title:$("postTitle").value.trim(), excerpt:$("postExcerpt").value.trim(), category:$("postCategory").value, date:$("postDate").value, image:currentImage, content:content.innerHTML};
        openPreview(draft);
    });
    $("uploadImageBtn").addEventListener("click", () => file.click());
    $("removeImageBtn").addEventListener("click", () => { setImage(""); file.value = ""; });
    file.addEventListener("change", () => {
        const selectedFile = file.files && file.files[0]; if (!selectedFile) return;
        if (!selectedFile.type.startsWith("image/")) { notify("Please choose an image file."); file.value = ""; return; }
        const reader = new FileReader(); reader.onload = event => setImage(event.target.result); reader.readAsDataURL(selectedFile);
    });
    document.querySelectorAll(".editor-toolbar button").forEach(button => button.addEventListener("click", () => { content.focus(); document.execCommand(button.dataset.command, false, null); }));
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") { if (previewModal.classList.contains("open")) closePreview(); else if (modal.classList.contains("open")) closePostModal(); }
    });

    
    posts.forEach(post => updateRow(post));
    applyFilters();
});