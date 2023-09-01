import { validateFile, handleDragDropAndUploadEvents } from "./reusable.js";

const fileInput = document.getElementById("fileInput");
const fileListDiv = document.querySelector(".file_list_div");
const loadingElement = document.createElement("p");
loadingElement.classList = "text-center";
const fileList = document.createElement("ol");
fileList.classList = "file_list";
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
      "drop_shadow medium_text download py-1 px-2 bg-success text-light border-dark border border-2"
    );
    downloadAllButton.innerHTML = "Download All";

    // ZIP multiple files and download when clicked downloadAllButton...
    downloadAllButton.addEventListener("click", async () => {
      const formatSelects = fileList.querySelectorAll(".select_img_format");
      const imgTags = fileList.querySelectorAll(".preview_image");
      const zip = new JSZip();

      formatSelects.forEach((formatSelect, index) => {
        const imgTag = imgTags[index];
        const imgUrl = imgTag.getAttribute("src");
        const fileName =
          imgTag.previousElementSibling.textContent.split(".")[0];
        const selectedFormat = formatSelect.value;
        const imgBlob = fetch(imgUrl).then((response) => response.blob());

        zip.file(`${fileName}.${selectedFormat}`, imgBlob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = "MediaCraft PRO Converted Images.zip";
      downloadLink.click();
    });

    fileListDiv.insertAdjacentElement("afterend", downloadAllButton);
  }
}

// function to handle uploaded files
async function handleUploadedFiles(uploadedFiles) {
  removeDownloadAllButton(); // Removed existing downloadAllButton

  if (uploadedFiles.length > 0) {
    fileList.innerHTML = "";
    fileListDiv.innerHTML = ""; // Clear existing content
    displayLoadingElement(uploadedFiles);

    const maxImageFileSize = 10 * 1024 * 1024; // 10MB in bytes
    const supportedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    const supportedImageTypesString = supportedImageTypes
      .map((type) => type.split("/")[1].toUpperCase())
      .join(", ");

    for (const file of uploadedFiles) {
      console.log(file.type);
      const fileName = file.name.split(".")[0];

      // validate image size and type
      if (
        !validateFile(
          file,
          maxImageFileSize,
          supportedImageTypes,
          supportedImageTypesString,
          loadingElement
        )
      ) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imgSrc = e.target.result;
        fileList.innerHTML += `<li>
       <p>${file.name}</p>
       <img class="preview_image" src="${imgSrc}" alt="Preview">
       <select name="select_img_format" class="select_img_format">
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
          <option value="avif">AVIF</option>
       </select>
       <button class="download_btn drop_shadow p-1 bg-light" data-filename="${fileName}">Download</button>
       </li>`;
      };

      reader.readAsDataURL(file);
    }

    // Wait for all files to be loaded
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

    // Attached click event listeners to download buttons
    const downloadButtons = fileList.querySelectorAll(".download_btn");
    downloadButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const formatSelect = btn.previousElementSibling;
        const imgTag = btn.previousElementSibling.previousElementSibling;
        const imgUrl = imgTag.getAttribute("src");
        const fileName = btn.getAttribute("data-filename");
        const selectedFormat = formatSelect.value;
        const imgBlob = await fetch(imgUrl).then((response) => response.blob());

        const zip = new JSZip();
        zip.file(`${fileName}.${selectedFormat}`, imgBlob);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(zipBlob);
        downloadLink.download = `MediaCraft PRO ${selectedFormat.toUpperCase()} Images.zip`;
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
