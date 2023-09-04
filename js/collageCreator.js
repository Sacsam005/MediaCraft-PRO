// user stories
// select the template
// when template is selected show upload pictures input and also the template
// after the pictures are uploaded attach download button to download that collage

import { validateFile, handleDragDropAndUploadEvents } from "./reusable.js";

// cookies on the client-side
document.cookie = "cookieName=cookieValue; SameSite=None; Secure";

// dom objects declarations
const imageGridContainers = document.querySelectorAll(".image_grid_container");

// image count for collage
const imagesCount = document.querySelectorAll(".images_count");
imagesCount.forEach((img) => {
  const count = img.parentElement.previousElementSibling.children.length;
  img.innerText = `${count} images`;
});

// popup
const popupSelectedCollage = document.createElement("div");
popupSelectedCollage.classList = "popup_selected_collage";

// close btn
const closeBtn = document.createElement("p");
closeBtn.classList = "px-2 py-1 close_btn bg-danger text-light ";
closeBtn.setAttribute("style", "font-weight: 700");
closeBtn.innerHTML = `CLOSE`;

// download collage button
const downloadCollageBtn = document.createElement("button");
downloadCollageBtn.setAttribute(
  "class",
  "medium_text download drop_shadow py-1 px-2 mt-2 bg-success text-light border-dark border border-2"
);
downloadCollageBtn.innerHTML = "Download Collage";

// files upload container
const uploadFilesContainer = document.createElement("div");
uploadFilesContainer.classList =
  "d-flex justify-content-center align-items-center flex-column p-3 drag_and_drop_div";
uploadFilesContainer.innerHTML = `
        <div
          class="d-flex justify-content-between align-items-center flex-column m-2 p-2 drop"
        >
        <p class="images_count_element"></p>
          <img
            src="../../Images/drag_and_drop.png"
            alt="Drag and Drop"
            width="64px"
            height="64px"
          />
          <p class="mb-0">Drag and Drop</p>
        </div>
        <h6 style="font-weight: 700" class="mb-0 p-2">OR</h6>
        <label
          for="fileInput"
          class="drop_shadow px-3 py-2 border-dark border border-2"
          style="background: #FFC107"
          ><img src="../../Images/add.png" alt="Upload" width="20px" />
          Upload</label
        >
        <input
          class="p-2 d-none"
          type="file"
          id="fileInput"
          accept="image/*"
          multiple
        />
      `;

let imageGrid = null;
let downloadEventListenerAttached = false;

imageGridContainers.forEach((container) => {
  const selectCollageBtn = container.querySelector(".select_collage_btn");
  selectCollageBtn.addEventListener("click", () => {
    // Clone the image grid
    imageGrid = container.querySelector(".image_grid").cloneNode(true);

    // Insert the popupSelectedCollage, closeBtn and selected imageGrid for view...
    popupSelectedCollage.insertAdjacentElement("afterbegin", closeBtn);
    popupSelectedCollage.insertAdjacentElement(
      "afterbegin",
      uploadFilesContainer
    );
    uploadFilesContainer.insertAdjacentElement("afterend", imageGrid);
    container.insertAdjacentElement("beforebegin", popupSelectedCollage);
    uploadFilesContainer.querySelector(
      ".images_count_element"
    ).innerText = `Add ${imageGrid.children.length} images`;

    if (uploadFilesContainer) {
      const closeBtn = popupSelectedCollage.querySelector(".close_btn");
      closeBtn.addEventListener("click", () => {
        popupSelectedCollage.remove();
        imageGrid.remove();
        downloadCollageBtn.remove();
      });
    }

    // attach download collage button
    if (!downloadEventListenerAttached) {
      downloadCollageBtn.addEventListener("click", async () => {
        downloadEventListenerAttached = true;
        const confirmDownload = confirm("Download your collage image?");
        if (!confirmDownload) {
          return;
        } else {
          window.scrollTo(0, 0);
          html2canvas(imageGrid, {
            allowTaint: true,
            cors: false,
            scrollX: -window.scrollX,
            scrollY: -window.scrollY,
            windowWidth: imageGrid.scrollWidth,
            windowHeight: imageGrid.scrollHeight,
          }).then(async function (canvas) {
            const zip = new JSZip();

            // convert the canvas to a Blob
            const canvasBlob = await new Promise((resolve) => {
              canvas.toBlob((blob) => {
                resolve(blob);
              });
            });

            // add the canvas image to the zip
            zip.file("MediaCraft PRO Collage.png", canvasBlob);

            // generate the zip blob
            const zipBlob = await zip.generateAsync({ type: "blob" });

            // create a download link and trigger the download
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = "MediaCraft_PRO_Collage.zip";
            downloadLink.click();
          });
        }
      });
    }
  });
});

async function handleUploadedFiles(uploadedFiles) {
  const currentRequiredImagesCount =
    uploadFilesContainer.nextElementSibling.children.length;

  if (uploadedFiles.length !== currentRequiredImagesCount) {
    alert(
      `Please upload ${currentRequiredImagesCount} images for the selected collage.`
    );
    return;
  }

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

  for (let i = 0; i < uploadedFiles.length; i++) {
    const file = uploadedFiles[i];

    // validate image size and type
    if (
      !validateFile(
        file,
        maxImageFileSize,
        supportedImageTypes,
        supportedImageTypesString
      )
    ) {
      return;
    }
  }

  for (let i = 0; i < imageGrid.children.length; i++) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgSrc = e.target.result;
      imageGrid.children[i].src = imgSrc;
    };
    reader.readAsDataURL(uploadedFiles[i]);
  }

  await Promise.all(
    Array.from(uploadedFiles).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = resolve;
          reader.readAsDataURL(file);
          uploadFilesContainer.remove();
        })
    )
  );
  imageGrid.insertAdjacentElement("beforebegin", downloadCollageBtn);
}

// handle collage image upload
if (popupSelectedCollage) {
  const fileInput = uploadFilesContainer.querySelector("#fileInput");
  // imported from reusable for upload or drag and drop
  handleDragDropAndUploadEvents(fileInput, handleUploadedFiles);
}
