// export function for image conversion to different formats
export async function convertImageToDifferentFormat(uploadedFiles, format) {
  const fileListDiv = document.querySelector(".file_list_div");
  const fileList = document.createElement("ol");
  fileList.className = "file_list";

  const loadingElement = document.createElement("p");
  loadingElement.innerHTML = `<p class="text-center">${uploadedFiles.length} ${
    uploadedFiles.length > 1 ? "files" : "file"
  } - Converting...</p>`;

  if (uploadedFiles.length > 0) {
    fileList.innerHTML = "";
    fileListDiv.innerHTML = "";
    fileListDiv.appendChild(loadingElement);

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
        const imgTag = document.createElement("img");
        imgTag.className = "preview_image";
        imgTag.src = imgSrc;
        imgTag.alt = "Preview";

        const selectTag = document.createElement("select");
        selectTag.className = "select_img_format selectDisabled";
        const optionTag = document.createElement("option");
        optionTag.value = format.toUpperCase();
        optionTag.setAttribute("data-filename", fileName);
        optionTag.setAttribute("selected", "selected");
        optionTag.setAttribute("disabled", "disabled");
        optionTag.textContent = `Converting to ${format.toUpperCase()}...`;
        selectTag.appendChild(optionTag);

        fileList.appendChild(createFileListItem(file.name, imgTag, selectTag));

        const convertedBlob = await convertImageFormat(imgSrc, format);
        const convertedImgUrl = URL.createObjectURL(convertedBlob);
        imgTag.src = convertedImgUrl;
        optionTag.textContent = `${format.toUpperCase()} (Converted)`;
        optionTag.removeAttribute("disabled");
      };
      reader.readAsDataURL(file);
    }
  }

  // wait for all files to be loaded and converted
  await Promise.all(
    Array.from(uploadedFiles).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = resolve;
        reader.readAsDataURL(file);
      });
    })
  );

  fileListDiv.removeChild(loadingElement);
  fileListDiv.appendChild(fileList);

  addDownloadAllButton(fileListDiv, fileList, format);
}

// create a list item for each file
function createFileListItem(name, imgTag, selectTag) {
  const liTag = document.createElement("li");
  const pTag = document.createElement("p");
  pTag.textContent = name;

  liTag.appendChild(pTag);
  liTag.appendChild(imgTag);
  liTag.appendChild(selectTag);

  return liTag;
}

// function to convert image format
async function convertImageFormat(imgSrc, format) {
  const img = new Image();
  img.src = imgSrc;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, `image/${format}`);
  });
}

// add the downloadAllButton with zip functionality
function addDownloadAllButton(fileListDiv, fileList, format) {
  const downloadAllButton = document.createElement("button");
  downloadAllButton.setAttribute(
    "class",
    "download drop_shadow medium_text py-1 px-2 bg-success text-light border-dark border border-2"
  );
  downloadAllButton.innerHTML = "Download All";

  downloadAllButton.addEventListener("click", async () => {
    const imgTags = fileList.querySelectorAll(".preview_image");
    const imgUrls = Array.from(imgTags).map((img) => img.getAttribute("src"));
    const fileNames = Array.from(imgTags).map(
      (img) => img.previousElementSibling.textContent.split(".")[0]
    );

    const zip = new JSZip();

    for (let i = 0; i < imgUrls.length; i++) {
      const imgUrl = imgUrls[i];
      const fileName = fileNames[i];
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      zip.file(`${fileName}.${format}`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = `MediaCraft PRO ${format.toUpperCase()} Images.zip`;
    downloadLink.click();
  });

  fileListDiv.insertAdjacentElement("afterend", downloadAllButton);
}

// -----------------------------------------------------------------------

// export function for video conversion to different formats
export async function convertVideoToDifferentFormat(uploadedFiles, format) {
  const fileListDiv = document.querySelector(".file_list_div");
  const fileList = document.createElement("ol");
  fileList.className = "file_list";

  const loadingElement = document.createElement("p");
  loadingElement.innerHTML = `<p class="text-center">${uploadedFiles.length} ${
    uploadedFiles.length > 1 ? "files" : "file"
  } - Loading...</p>`;

  function removeDownloadAllButton() {
    const downloadAllButton = document.querySelector(".download");
    if (downloadAllButton) {
      downloadAllButton.remove();
    }
  }

  function addDownloadAllButton() {
    const downloadAllButton = document.createElement("button");
    downloadAllButton.setAttribute(
      "class",
      "download drop_shadow medium_text py-1 px-2 bg-success text-light border-dark border border-2"
    );
    downloadAllButton.innerHTML = "Download All";

    downloadAllButton.addEventListener("click", async () => {
      const confirmDownload = confirm("Download process will start. Proceed?");
      if (!confirmDownload) {
        return;
      }

      const videoTags = fileList.querySelectorAll(".preview_video");
      const zip = new JSZip();

      for (const videoTag of videoTags) {
        const videoUrl = videoTag.querySelector("source").getAttribute("src");
        const fileName =
          videoTag.previousElementSibling.textContent.split(".")[0];

        const response = await fetch(videoUrl);
        const blob = await response.blob();
        zip.file(`${fileName}.${format}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `MediaCraft PRO ${format.toUpperCase()} Videos.zip`;
      downloadLink.click();
    });

    fileListDiv.insertAdjacentElement("afterend", downloadAllButton);
  }

  if (uploadedFiles.length > 0) {
    removeDownloadAllButton();
    fileList.innerHTML = "";
    fileListDiv.innerHTML = "";
    fileListDiv.appendChild(loadingElement);

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
       <select name="select_video_format" class="select_video_format selectDisabled">
          <option value="${format.toUpperCase()}" data-filename="${fileName}" selected disabled>Converting to ${format.toUpperCase()}...</option>
       </select>
       </li>`;

        const selectFormat = fileList.querySelector(".selectDisabled");
        await convertVideoToFormat(file, format, selectFormat, fileName);
      };

      reader.readAsDataURL(file);
    }
  }

  // wait for all files to be loaded
  await Promise.all(
    Array.from(uploadedFiles).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = resolve;
        reader.readAsDataURL(file);
      });
    })
  );

  fileListDiv.removeChild(loadingElement);
  fileListDiv.appendChild(fileList);

  addDownloadAllButton();
}

async function convertVideoToFormat(file, format, selectElement, fileName) {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = URL.createObjectURL(file);

  video.onloadedmetadata = async () => {
    selectElement.innerHTML = `<option value="${format.toUpperCase()}" data-filename="${fileName}">Converted to ${format.toUpperCase()}</option>`;
  };
}

// ----------------------------------

export function handleDragDropAndUploadEvents(
  fileInput,
  convertMedia,
  format = null
) {
  fileInput.addEventListener("change", async (event) => {
    const files = event.target.files;
    await convertMedia(files, format);
  });

  // prevent the default drag-and-drop behavior
  document.body.addEventListener("dragenter", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.body.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  document.body.addEventListener("drop", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    await convertMedia(files, format);
  });
}

// export function to validate file size and type on upload
export function validateFile(
  file,
  maxFileSize,
  supportedTypes,
  supportedTypesString,
  loadingElement
) {
  const fileSize = file.size;

  if (fileSize > maxFileSize) {
    showError(
      `File size exceeds the maximum limit of ${
        maxFileSize / (1024 * 1024)
      }MB: ${file.name} is ${Math.round(file.size / (1024 * 1024))}MB`,
      loadingElement
    );
    return false;
  }

  if (!supportedTypes.includes(file.type)) {
    showError(
      `Unsupported file type: ${file.name}\nSupported types: ${supportedTypesString}`,
      loadingElement
    );
    return false;
  }

  return true;
}

function showError(message, loadingElement = null) {
  if (loadingElement) {
    loadingElement.remove();
  }
  alert(message);
}
