const header = document.querySelector("header");
const main = document.querySelector("main");

const uploader = document.querySelector("#uploader");
const uploadArea = main.querySelector("#upload_area");
const title = uploadArea.querySelector("h1");
var browseFilesBtn = uploadArea.querySelector("#browse_files_btn");

tailwind.config = {
    theme: {
        fontFamily: {
            sans: ["Inter", "sans-serif"]
        }
    }
};

if (window.innerWidth <= 550) {
    removeDragEventListeners();
    document.body.addEventListener("click", () => uploader.click());
} else {
    addDragEventListeners();
    document.body.removeEventListener("click", () => uploader.click());
}

main.setAttribute("style", `height: calc(100vh - ${header.clientHeight + 5}px);`);

browseFilesBtn.addEventListener("click", () => uploader.click());
uploader.addEventListener("change", handleUpload);

function handleUpload(e) {
    browseFilesBtn.remove();

    title.innerText = "UPLOADING...";

    let strong = title.nextElementSibling.querySelector("strong");
    strong.classList = "block text-xl text-center font-extrabold";
    strong.innerHTML = "0&percnt; COMPLETE";

    let progressBar = document.createElement("progress");
    progressBar.classList = "appearance-none w-96 h-3 mt-8 bg-slate-200 border-none rounded duration-150";
    progressBar.value = 0;
    progressBar.max = 100;

    title.nextElementSibling.append(progressBar);

    upload(e, strong, progressBar);
}

function upload(e, strong, bar) {
    let files = new FormData();
    for (let file of e.target.files) files.append("files", file);
 
    let request = new XMLHttpRequest();
    
    request.open("POST", "/upload", true);
    request.responseType = "json";

    request.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
            let progress = (e.loaded / e.total) * 100;

            bar.value = progress;
            bar.innerText = `${Math.round(progress)}&percnt;`;
            strong.innerHTML = `${Math.round(progress)}&percnt; COMPLETE`;
        }
    });

    request.addEventListener("readystatechange", (e) => {
        if (e.target.readyState != 4) return;

        if (e.target.status != 200) {
            let errorDialog = document.createElement("div");
    
            errorDialog.classList = "error-dialog";
            errorDialog.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Unable to upload file(s) right now. Please try again later.';
        
            document.querySelector(".error-dialog")?.remove();
            document.body.append(errorDialog);
            return;
        }

        title.classList = "text-5xl font-black text-emerald-400 cursor-pointer";
        title.innerText = `${document.location.href}${e.target.response.id}`.toUpperCase();
        
        strong.innerText = "CLICK THE LINK ABOVE TO COPY";
        strong.classList = "block text-xl text-center font-extrabold text-emerald-200";

        let resetUploaderBtn = document.createElement("button");

        resetUploaderBtn.classList = "inline-block align-middle bg-blue-600 text-white text-xs font-semibold mt-8 pt-2.5 pb-2.5 pl-4 pr-4 rounded duration-150 hover:bg-blue-700 active:bg-blue-800";
        resetUploaderBtn.id = "reset_uploader_btn";
        resetUploaderBtn.innerText = "UPLOAD MORE";

        resetUploaderBtn.addEventListener("click", resetUploader);

        bar.replaceWith(resetUploaderBtn);

        removeDragEventListeners();
    });

    request.send(files);
}

function addDragEventListeners() {
    main.addEventListener("dragenter", handleDragEnterEvent);
    main.addEventListener("dragleave", handleDragLeaveEvent);

    main.addEventListener("dragover", handleDragOverEvent);
    main.addEventListener("drop", handleDropEvent);
}

function removeDragEventListeners() {
    main.removeEventListener("dragenter", handleDragEnterEvent);
    main.removeEventListener("dragleave", handleDragLeaveEvent);

    main.removeEventListener("dragover", handleDragOverEvent);
    main.removeEventListener("drop", handleDropEvent);
}

function handleDropEvent(e) {
    e.preventDefault();
    
    uploader.files = e.dataTransfer.files;
    uploader.dispatchEvent(new Event("change"));
    
    handleDragLeaveEvent();
}

function handleDragOverEvent(e) {
    e.preventDefault();
    if (!title.classList.contains("text-slate-500")) {
        title.classList.add("text-slate-500");
        title.classList.remove("text-slate-800");
    }
}

function handleDragEnterEvent() {
    title.classList.add("text-slate-500");
    title.classList.remove("text-slate-800");
}

function handleDragLeaveEvent() {
    title.classList.add("text-slate-800");
    title.classList.remove("text-slate-500");
}

function resetUploader(e) {
    title.classList = "text-5xl font-black text-slate-800 pointer-events-none";
    title.innerText = "DROP FILES ONTO THIS PAGE";

    e.target.previousElementSibling.classList = "inline-block align-middle text-xl font-extrabold mr-4 pointer-events-none";
    e.target.previousElementSibling.innerText = "OR";

    browseFilesBtn = document.createElement("button");
    browseFilesBtn.classList = "inline-block align-middle bg-blue-600 text-white text-xs font-semibold pt-2.5 pb-2.5 pl-4 pr-4 rounded duration-150 hover:bg-blue-700 active:bg-blue-800";
    browseFilesBtn.id = "browse_files_btn";
    browseFilesBtn.innerText = "BROWSE FILES";

    e.target.previousElementSibling.after(browseFilesBtn);
    browseFilesBtn.addEventListener("click", () => uploader.click());

    e.target.remove();

    addDragEventListeners();
}