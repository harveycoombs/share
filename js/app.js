const uploadArea = document.querySelector("#upload_area"),
    manualUploadBtn = uploadArea.querySelector("#manual_upload_btn"),
    uploader = uploadArea.querySelector("#uploader");

uploadArea.addEventListener("dragenter", () => {
    uploadArea.classList.add("active-drag");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("active-drag");
});

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();

    if (!uploadArea.classList.contains("active-drag")) {
        uploadArea.classList.add("active-drag");
    }
});

uploader.addEventListener("dragover", (e) => {
    e.preventDefault();
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploader.files = e.dataTransfer.files;
    uploadArea.classList.remove("active-drag");
});

uploader.addEventListener("change", processUpload);

manualUploadBtn.addEventListener("click", () => {
    uploader.click();
});

function processUpload(e) {
    let files;

    fetch("/upload", {
        method: "POST",
        body: files
    }).then(response => response.json()).then((result) => {
        if (!result.success) {
            displayError("Unable to upload file(s) right now. Please try again later.");
            return;
        }

        window.open(result.url, "_blank");
    }).catch(() => {
        displayError("Unable to upload file(s) right now. Please try again later.");
    });
}

function displayError(message) {
    let errorDialog = document.createElement("div");
    
    errorDialog.classList = "error-dialog";
    errorDialog.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

    document.querySelector(".error-dialog")?.remove();
    document.body.append(errorDialog);
}