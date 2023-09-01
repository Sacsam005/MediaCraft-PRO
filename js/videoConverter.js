import { validateFile, handleDragDropAndUploadEvents } from "./reusable.js";

const fileInput = document.getElementById("fileInput");
const fileListDiv = document.querySelector(".file_list_div");
const loadingElement = document.createElement("p");
loadingElement.classList = "text-center";
const fileList = document.createElement("ol");
fileList.className = "file_list";
const supportedVideoFormats = ["mp4", "webm", "mov", "avi", "mkv", "wmv"];
let downloadAllButton = null;

// display files loading element
function displayLoadingElement(files) {
  loadingElement.innerHTML = `${files.length} ${
    files.length > 1 ? "files" : "file"
  } - Loading...`;
  fileListDiv.appendChild(loadingElement);
}

// remove the existing downloadAllButton
function removeDownloadAllButton() {
  if (downloadAllButton) {
    downloadAllButton.remove();
    downloadAllButton = null;
  }
}

// add the downloadAllButton
function addDownloadAllButton() {
  if (!downloadAllButton) {
    downloadAllButton = document.createElement("button");
    downloadAllButton.setAttribute(
      "class",
      "drop_shadow medium_text download py-1 px-2 mx-1 bg-success text-light border-dark border border-2"
    );
    downloadAllButton.innerHTML = "Download All";

    // ZIP multiple files and download when clicked downloadAllButton...
    downloadAllButton.addEventListener("click", async () => {
      const formatSelects = fileList.querySelectorAll(".select_video_format");
      const videoTags = fileList.querySelectorAll(".preview_video");

      const zip = new JSZip();
      const downloadPromises = [];

      videoTags.forEach((videoTag, index) => {
        const formatSelect = formatSelects[index];
        const videoUrl = videoTag.querySelector("source").getAttribute("src");
        const fileName =
          videoTag.previousElementSibling.textContent.split(".")[0];
        const selectedFormat = formatSelect.value;

        const downloadPromise = fetch(videoUrl)
          .then((response) => response.blob())
          .then((videoBlob) => {
            zip.file(`${fileName}.${selectedFormat}`, videoBlob);
          })
          .catch((error) => {
            console.error(`Error fetching video ${fileName}:`, error);
          });

        downloadPromises.push(downloadPromise);
      });

      await Promise.all(downloadPromises);

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = "MediaCraft PRO Converted Videos.zip";
      downloadLink.click();
    });

    fileListDiv.insertAdjacentElement("afterend", downloadAllButton);
  }
}

// function to handle uploaded files
async function handleUploadedFiles(uploadedFiles) {
  removeDownloadAllButton(); // remove existing downloadAllButton

  if (uploadedFiles.length > 0) {
    fileList.innerHTML = "";
    fileListDiv.innerHTML = "";
    displayLoadingElement(uploadedFiles);

    const maxVideoFileSize = 100 * 1024 * 1024; // 100MB in bytes
    const supportedVideoTypes = [
      "video/mp4",
      "video/mkv",
      "video/mov",
      "video/avi",
      "video/webm",
      "video/wmv",
      "video/x-ms-wmv",
      "video/vnd.dlna.mpeg-tts",
      "video/quicktime",
    ];
    const supportedVideoTypesString = supportedVideoTypes
      .map((type) => type.split("/")[1].toUpperCase())
      .join(", ");

    for (const file of uploadedFiles) {
      console.log(file.type);
      const fileName = file.name.split(".")[0];

      // validate video size and type
      if (
        !validateFile(
          file,
          maxVideoFileSize,
          supportedVideoTypes,
          supportedVideoTypesString,
          loadingElement
        )
      ) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const videoSrc = e.target.result;
        fileList.innerHTML += `<li>
           <p>${file.name}</p>
           <video class="preview_video" controls>
              <source src="${videoSrc}" type="video/mp4">
              Your browser does not support the video tag.
           </video>
           <select name="select_video_format" class="select_video_format">
              ${supportedVideoFormats
                .map(
                  (format) =>
                    `<option value="${format}">${format.toUpperCase()}</option>`
                )
                .join("")}
           </select>
           <button class="download_btn drop_shadow p-1 bg-light" data-filename="${fileName}">Download</button>
           </li>`;
      };

      reader.readAsDataURL(file);
    }

    // wait for all files to be loaded
    await Promise.all(
      Array.from(uploadedFiles).map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = resolve;
            reader.readAsDataURL(file);
          })
      )
    );

    fileListDiv.removeChild(loadingElement);
    fileListDiv.appendChild(fileList);

    // Attach click event listeners to download buttons
    const downloadButtons = fileList.querySelectorAll(".download_btn");
    downloadButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const formatSelect = btn.previousElementSibling;
        const videoTag = btn.previousElementSibling.previousElementSibling;
        const videoUrl = videoTag.querySelector("source").getAttribute("src");
        const fileName = btn.getAttribute("data-filename");
        const selectedFormat = formatSelect.value;

        const videoBlob = await fetch(videoUrl).then((response) =>
          response.blob()
        );

        const zip = new JSZip();
        zip.file(`${fileName}.${selectedFormat}`, videoBlob);

        const zipBlob = await zip.generateAsync({ type: "blob" });

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(zipBlob);
        downloadLink.download = `MediaCraft PRO ${selectedFormat.toUpperCase()} Videos.zip`;
        downloadLink.click();
      });
    });

    if (uploadedFiles.length > 1) {
      addDownloadAllButton();
    }
  }
}

// imported from reusable.js for upload or drag and drop
handleDragDropAndUploadEvents(fileInput, handleUploadedFiles);
