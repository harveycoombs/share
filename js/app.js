const header = document.querySelector("header");
const main = document.querySelector("main");

const manualUploadBtn = header.querySelector("#manual_upload_btn");
const uploader = main.querySelector("#uploader");
const title = main.querySelector("h1");

main.setAttribute("style", `height: ${window.innerHeight - (header.clientHeight + 24)}px;`);

manualUploadBtn.addEventListener("click", () => uploader.click());

window.addEventListener("resize", () => {
    main.setAttribute("style", `height: ${window.innerHeight - (header.clientHeight + 24)}px;`);
});

if (window.innerWidth <= 550) {
    removeDragEventListeners();
    document.body.addEventListener("click", () => uploader.click());
} else {
    addDragEventListeners();
    document.body.removeEventListener("click", () => uploader.click());
}

uploader.addEventListener("change", (e) => {
    title.innerHTML = 'UPLOADING<progress id="upload_progress_bar" value="0" max="100"></progress>';

    let bar = title.querySelector("#upload_progress_bar");

    let files = new FormData();
    for (let file of e.target.files) files.append("files", file);
 
    let request = new XMLHttpRequest();
    request.open("POST", "/upload", true);

    request.responseType = "json";

    request.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
            let progress = (e.loaded / e.total) * 100;

            bar.value = progress;
            bar.innerText = `${progress}%`;
        }
    });

    request.addEventListener("readystatechange", (e) => {
        if (e.target.status != 200) {
            let errorDialog = document.createElement("div");
    
            errorDialog.classList = "error-dialog";
            errorDialog.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Unable to upload file(s) right now. Please try again later.';
        
            document.querySelector(".error-dialog")?.remove();
            document.body.append(errorDialog);
            return;
        }

        console.log(e.target);

        let result = e.target.response;

        removeDragEventListeners();
        
        title.classList.add("upload-url");

        setTimeout(() => {
            title.innerHTML = `<i class="fa-solid fa-circle-check"></i> <a href="${document.location.href}uploads/${result.id}" target="_blank">${document.location.href}uploads/${result.id}</a>`;

            let resetUploaderBtn = document.createElement("button");

            resetUploaderBtn.classList = "button";
            resetUploaderBtn.id = "reset_uploader_btn";
            resetUploaderBtn.innerText = "Upload More";

            resetUploaderBtn.addEventListener("click", resetUploader);

            title.after(resetUploaderBtn);

            manualUploadBtn.remove();
        }, 180);        
    });

    request.send(files);
});

function addDragEventListeners() {
    document.body.addEventListener("dragenter", handleDragEnterEvent);
    document.body.addEventListener("dragleave", handleDragLeaveEvent);

    document.body.addEventListener("dragover", handleDragOverEvent);
    document.body.addEventListener("drop", handleDropEvent);
}

function removeDragEventListeners() {
    document.body.removeEventListener("dragenter", handleDragEnterEvent);
    document.body.removeEventListener("dragleave", handleDragLeaveEvent);

    document.body.removeEventListener("dragover", handleDragOverEvent);
    document.body.removeEventListener("drop", handleDropEvent);
}

function handleDropEvent(e) {
    e.preventDefault();
    
    uploader.files = e.dataTransfer.files;
    uploader.dispatchEvent(new Event("change"));
    
    document.body.classList.remove("active-drag");
}

function handleDragOverEvent(e) {
    e.preventDefault();
    if (!document.body.classList.contains("active-drag")) document.body.classList.add("active-drag");
}

function handleDragEnterEvent() {
    document.body.classList.add("active-drag");
}

function handleDragLeaveEvent() {
    document.body.classList.remove("active-drag");
}

function resetUploader(e) {
    e.target.remove();

    title.classList.remove("upload-url");
    title.innerHTML = '<span class="drop-msg">DROP FILES</span><span class="click-msg">CLICK</span> HERE TO UPLOAD';

    addDragEventListeners();
}