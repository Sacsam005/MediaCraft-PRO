const fileInput = document.getElementById("fileInput");
const dragAndDropDiv = document.querySelector(".drag_and_drop_div");
const mediaPreviewDiv = document.querySelector(".media_preview_div");
const downloadBtn = document.createElement("button");
downloadBtn.classList = "py-1 px-2 bg-success text-light medium_text download";
downloadBtn.textContent = "Download";
let downloadEventListenerAttached = false;

let currentFilters = {};
const filterControls = document.createElement("div");
filterControls.classList = "filter_controls w-50 p-2";
filterControls.innerHTML = `
          <h4><strong>Filter Controls</strong></h4>
          <div class="filter_control">
            <label for="blur">Blur</label>
            <input type="range" id="blur" min="0" max="5" value="0" />
            <span class="slider_value"></span>
          </div>

          <div class="filter_control">
            <label>Brightness</label>
            <input type="range" id="brightness" min="0" max="200" value="100" />
            <span class="slider_value"></span>
          </div>

          <div class="filter_control">
            <label for="grayscale">Grayscale</label>
            <input type="range" id="grayscale" min="0" max="100" value="0" />
            <span class="slider_value"></span>
          </div>
          
          <div class="filter_control">
            <label for="hue-rotate">Hue Rotate</label>
            <input type="range" id="hue-rotate" min="0" max="360" value="0" />
            <span class="slider_value"></span>
          </div>

          <div class="filter_control">
            <label for="invert">Invert</label>
            <input type="range" id="invert" min="0" max="100" value="0" />
            <span class="slider_value"></span>
          </div>
          
          <div class="filter_control">
            <label for="opacity">Opacity</label>
            <input type="range" id="opacity" min="0" max="100" value="100" />
            <span class="slider_value"></span>
          </div>

          <div class="filter_control">
            <label for="saturate">Saturate</label>
            <input type="range" id="saturate" min="0" max="50" value="5" />
            <span class="slider_value"></span>
          </div>
          
          <div class="filter_control">
            <label for="sepia">Sepia</label>
            <input type="range" id="sepia" min="0" max="100" value="0" />
            <span class="slider_value"></span>
          </div>
          
          <div class="filter_control filter_control_border d-flex justify-content-between align-items-center">
            <div class="border_width_div">
              <label for="borderWidth">Border Width</label>
              <input type="range" id="borderWidth" min="0" max="20" value="0" />
              <span class="slider_value"></span>
            </div>

            <div>
              <label for="borderColor">Border Color</label>
              <input type="color" class="rounded-0 border-0" id="borderColor" value="#000000" />
            </div>
          </div>

          <div class="filter_control">
            <label for="borderRadius">Curve Edge</label>
            <input type="range" id="borderRadius" min="0" max="20" value="0" />
            <span class="slider_value"></span>
          </div>
        `;

async function handleUploadedFiles(uploadedFiles) {
  mediaPreviewDiv.innerHTML = "";

  for (const file of uploadedFiles) {
    const mediaElement = document.createElement("div");
    mediaElement.classList = "media_element w-50";

    const supportedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    const supportedImgTypesString = supportedImageTypes
      .map((type) => type.split("/")[1].toUpperCase())
      .join(", ");

    if (!supportedImageTypes.includes(file.type)) {
      alert(
        `Unsupported image type: ${file.name}\nSupported types: ${supportedImgTypesString}`
      );
      return;
    } else {
      dragAndDropDiv.remove();
    }

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    mediaElement.appendChild(img);

    // attach download button
    if (!downloadEventListenerAttached) {
      downloadBtn.addEventListener("click", () => {
        downloadEventListenerAttached = true;
        const media = mediaElement.querySelector("img");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = media.width;
        canvas.height = media.height;
        context.filter = media.style.filter;
        context.drawImage(media, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
        }, file.type);
      });

      mediaPreviewDiv.insertAdjacentElement("afterbegin", filterControls);
      mediaPreviewDiv.insertAdjacentElement("beforeend", mediaElement);
      mediaPreviewDiv.insertAdjacentElement("afterend", downloadBtn);
    }
  }
}

const borderWidthInput = filterControls.querySelector("#borderWidth");
const borderColorInput = filterControls.querySelector("#borderColor");
const borderRadiusInput = filterControls.querySelector("#borderRadius");

borderColorInput.addEventListener("click", () => {
  const borderWidth = parseInt(borderWidthInput.value);
  if (borderWidth === 0) {
    alert("Set border width first to see border color in effect.");
  }
});

// handle filters
filterControls.addEventListener("input", (event) => {
  const filterName = event.target.id;
  const filterValue = event.target.value;

  if (filterName === "borderWidth") {
    const displayValue = event.target.nextElementSibling;
    displayValue.textContent = `${filterValue}px`;

    const mediaElements = document.querySelectorAll(".media_element img");

    mediaElements.forEach((media) => {
      media.style.border = `${filterValue}px solid ${borderColorInput.value}`;
    });
  } else if (filterName === "borderColor") {
    const mediaElements = document.querySelectorAll(".media_element img");

    mediaElements.forEach((media) => {
      media.style.border = `${borderWidthInput.value}px solid ${filterValue}`;
    });

    if (filterValue === "0") {
      borderColorInput.disabled = true;
      borderColorInput.value = "#000";
    } else {
      borderColorInput.disabled = false;
    }
  } else if (filterName === "borderRadius") {
    const mediaElements = document.querySelectorAll(".media_element img");

    mediaElements.forEach((media) => {
      media.style.borderRadius = `${filterValue}%`;
    });
  } else {
    currentFilters[filterName] = filterValue;

    const displayValue = event.target.nextElementSibling;
    displayValue.textContent = filterValue;
    if (filterName === "blur") {
      displayValue.textContent += "px";
    } else if (filterName === "hue-rotate") {
      displayValue.textContent += "deg";
    } else if (filterName === "saturate") {
      displayValue.textContent += "";
    } else {
      displayValue.textContent += "%";
    }

    const mediaElements = document.querySelectorAll(".media_element img");

    mediaElements.forEach((media) => {
      let filterString = "";
      for (const [filter, value] of Object.entries(currentFilters)) {
        if (filter === "blur") {
          filterString += `${filter}(${value}px) `;
        } else if (filter === "hue-rotate") {
          filterString += `${filter}(${value}deg) `;
        } else if (filter !== "saturate") {
          filterString += `${filter}(${value}%) `;
        }
      }
      media.style.filter = filterString.trim();

      media.style.border = `${borderWidthInput.value}px solid ${borderColorInput.value}`;
      media.style.borderRadius = `${borderRadiusInput.value}%`;
    });
  }
});

// handle file upload
fileInput.addEventListener("change", async (event) => {
  const uploadedFiles = event.target.files;
  await handleUploadedFiles(uploadedFiles);
});

// Prevent the default drag-and-drop behavior
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

  const uploadedFiles = event.dataTransfer.files;
  await handleUploadedFiles(uploadedFiles);
});
