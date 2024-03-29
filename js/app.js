const uploadArea = document.querySelector("#upload_area"),
    manualUploadBtn = uploadArea.querySelector("#manual_upload_btn"),
    uploader = uploadArea.querySelector("#uploader");

uploadArea.addEventListener("dragenter", () => uploadArea.classList.add("active-drag"));
uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("active-drag"));

uploader.addEventListener("dragover", (e) => e.preventDefault());
manualUploadBtn.addEventListener("click", () => uploader.click());

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!uploadArea.classList.contains("active-drag")) uploadArea.classList.add("active-drag");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();

    uploader.files = e.dataTransfer.files;
    uploader.dispatchEvent(new Event("change"));
    
    uploadArea.classList.remove("active-drag");
});

uploader.addEventListener("change", (e) => {
    let placeholder = uploadArea.querySelector(".upload-area-placeholder");
    let loader = uploadArea.querySelector(".loader");

    placeholder.classList.add("hidden");
    loader.classList.remove("hidden");

    let files = new FormData();
    for (let file of e.target.files) files.append("files", file);

    fetch("/upload", {
        method: "POST",
        body: files
    }).then(response => response.json()).then((result) => {
        placeholder.classList.remove("hidden");
        loader.classList.add("hidden");

        let popup = document.createElement("div");

        popup.classList = "popup-container";
        popup.innerHTML = `<div class="popup"><div class="popup-header"><strong>Upload Successful</strong><div id="close_popup_btn"><i class="fa-solid fa-xmark"></i></div></div><input type="text" value="${document.location.href}uploads/${result.id}" class="field" id="upload_url_field" readonly /></div>`;

        document.querySelector(".popup-container")?.remove();
        document.body.append(popup);

        let closePopupBtn = popup.querySelector("#close_popup_btn");
        closePopupBtn.addEventListener("click", () => popup.remove());

        let uploadUrlField = popup.querySelector("#upload_url_field");
        uploadUrlField.focus();
        uploadUrlField.select();
    }).catch(() => {
        let errorDialog = document.createElement("div");
    
        errorDialog.classList = "error-dialog";
        errorDialog.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Unable to upload file(s) right now. Please try again later.';
    
        document.querySelector(".error-dialog")?.remove();
        document.body.append(errorDialog);
    });
});