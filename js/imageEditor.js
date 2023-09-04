import { validateFile } from "./reusable.js";

const fileInput = document.getElementById("fileInput");
const dragAndDropDiv = document.querySelector(".drag_and_drop_div");
const imageConversionDiv = document.querySelector(".image_conversion_div");
const loadingElement = document.createElement("p");
loadingElement.classList = "text-center";
loadingElement.setAttribute("style", "align-self: center");
const imagePreviewDiv = document.createElement("div");
imagePreviewDiv.classList = "image_preview_div";
imagePreviewDiv.innerHTML = `
      <div class="filtered_image_div d-flex justify-content-center align-items-center flex-column w-100">
      </div>

      <div class="filter_container d-flex justify-content-between align-items-start w-100 p-2">

        <div class="preset_filter_container">
           <h4><strong>Preset Filters</strong></h4>
  
           <div className="preset_filter">
              <a data-preset="vintage">Vintage</a>
            
              <a data-preset="lomo">Lomo</a>
            
              <a data-preset="clarity">Clarity</a>
            
              <a data-preset="sinCity">Sin City</a>
            
              <a data-preset="sunrise">Sunrise</a>
            
              <a data-preset="crossProcess">Cross Process</a>
            
              <a data-preset="orangePeel">Orange Peel</a>
            
              <a data-preset="love">Love</a>
            
              <a data-preset="grungy">Grungy</a>
            
              <a data-preset="jarques">Jarques</a>
            
              <a data-preset="pinhole">Pinhole</a>
            
              <a data-preset="oldBoot">Old Boot</a>
            
              <a data-preset="glowingSun">Glowing Sun</a>
            
              <a data-preset="hazyDays">Hazy Days</a>
            
              <a data-preset="herMajesty">Her Majesty</a>
            
              <a data-preset="nostalgia">Nostalgia</a>
            
              <a data-preset="hemingway">Hemingway</a>
            
              <a data-preset="concentrate">Concentrate</a>
            </div>

            <hr style="height: 1px; color: #888; margin: 0.2rem"/>

            <div class="image_adjustment_tools">
              <a id="crop">Crop</a>
              <a id="rotate_left">Rotate Left</a>
              <a id="rotate_right">Rotate Right</a>
            </div>
        </div>

        <div class="filter_controls_div">
          <h4><strong>Filter Controls</strong></h4>

          <div class="filter_control">
            <label for="stackBlur">Blur</label>
            <input type="range" id="stackBlur" min="0" max="20" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label>Brightness</label>
            <input type="range" id="brightness" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="contrast">Contrast</label>
            <input type="range" id="contrast" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>
          
          <div class="filter_control">
            <label for="saturation">Saturation</label>
            <input type="range" id="saturation" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="exposure">Exposure</label>
            <input type="range" id="exposure" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>
          
          <div class="filter_control">
            <label for="vibrance">Vibrance</label>
            <input type="range" id="vibrance" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="hue">Hue</label>
            <input type="range" id="hue" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="gamma">Gamma</label>
            <input type="range" id="gamma" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="clip">Clip</label>
            <input type="range" id="clip" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="hue">Hue</label>
            <input type="range" id="hue" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="sepia">Sepia</label>
            <input type="range" id="sepia" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="noise">Noise</label>
            <input type="range" id="noise" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>

          <div class="filter_control">
            <label for="sharpen">sharpen</label>
            <input type="range" id="sharpen" min="-100" max="100" value="0" />
            <span class="slider_value">0</span>
          </div>
        </div>
      </div>
`;

const buttonContainer = document.createElement("div");
buttonContainer.classList =
  "button_container d-flex justify-content-between align-items-center mt-2 mx-auto";
buttonContainer.innerHTML = `
      <button class="drop_shadow medium_text download py-1 px-2 m-2 border-dark border border-2 bg-success text-light w-100">Download</button>
      <button class="drop_shadow medium_text reset py-1 px-2 m-2 border-dark border border-2 bg-danger text-light w-100">Reset</button>
      <button class="drop_shadow medium_text restart py-1 px-2 m-2 border-dark border border-2 bg-warning w-100">Restart</button>
`;

const filteredImageDiv = imagePreviewDiv.querySelector(".filtered_image_div");
const downloadBtn = buttonContainer.querySelector(".download");
const resetBtn = buttonContainer.querySelector(".reset");
const restartBtn = buttonContainer.querySelector(".restart");

const canvas = document.createElement("canvas");
canvas.id = "canvas";
const ctx = canvas.getContext("2d");
let img = new Image();
let fileName;

// display image loading element
function displayLoadingElement() {
  loadingElement.innerHTML = `Loading Image...`;
  imagePreviewDiv.appendChild(loadingElement);
}

async function handleUploadedFiles(uploadedFile) {
  displayLoadingElement();

  const maxImageFileSize = 5 * 1024 * 1024; // 5MB in bytes
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

  // check for file
  const reader = new FileReader();
  if (uploadedFile) {
    fileName = uploadedFile.name;
    reader.readAsDataURL(uploadedFile);
  }

  // validate image size and type
  if (
    !validateFile(
      uploadedFile,
      maxImageFileSize,
      supportedImageTypes,
      supportedImageTypesString,
      loadingElement
    )
  ) {
    return;
  }

  // add image to canvas
  reader.addEventListener(
    "load",
    () => {
      img = new Image();
      img.src = reader.result;
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };
    },
    false
  );

  await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = resolve;
    reader.readAsDataURL(uploadedFile);
  });

  imagePreviewDiv.removeChild(loadingElement);
  dragAndDropDiv.remove();
  filteredImageDiv.insertAdjacentElement("afterbegin", canvas);
  imageConversionDiv.insertAdjacentElement("beforeend", imagePreviewDiv);
  imagePreviewDiv.insertAdjacentElement("afterend", buttonContainer);
}

fileInput.addEventListener("change", async (e) => {
  const uploadedFile = e.target.files[0];
  await handleUploadedFiles(uploadedFile);
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

  const uploadedFiles = event.dataTransfer.files;
  for (const uploadedFile of uploadedFiles) {
    await handleUploadedFiles(uploadedFile);
  }
});

const filterControls = imagePreviewDiv.querySelectorAll(
  '.filter_controls_div input[type="range"]'
);
filterControls.forEach((control) => {
  control.addEventListener("input", (e) => {
    let filterId = e.target.id;
    let filterValue = e.target.value;
    const sliderValueSpan = e.target.nextElementSibling;
    sliderValueSpan.innerHTML = `${filterValue}`;

    Caman("#canvas", img, function () {
      this.revert(false); // reset previous filter adjustments

      this[filterId](filterValue); // apply the selected filter
      this.render();
    });
  });
});

const presetFilters = imagePreviewDiv.querySelectorAll(
  ".preset_filter_container a[data-preset]"
);
let lastClickedPresetButton = null;
presetFilters.forEach((preset) => {
  preset.addEventListener("click", async (e) => {
    let presetName = e.target.dataset.preset;

    if (lastClickedPresetButton) {
      lastClickedPresetButton.style.backgroundColor = "";
    }

    // set the background color for the current clicked button
    e.target.style.backgroundColor = "#FFC107";
    lastClickedPresetButton = e.target;

    // remove any existing filter loader
    const existingFilterLoader =
      filteredImageDiv.querySelector(".content_loader");
    if (existingFilterLoader) {
      existingFilterLoader.remove();
    }

    // create and add the filter loader for the current filter
    const filterLoader = document.createElement("div");
    filterLoader.classList = "content_loader";
    filterLoader.innerHTML = `
      <p>Applying ${e.target.innerText}...</p>`;
    filteredImageDiv.insertAdjacentElement("beforeend", filterLoader);

    await Caman("#canvas", img, function () {
      this.revert(false); // reset previous filter adjustments
      this[presetName]();
      this.render(async () => {
        // this callback function will be called after rendering is complete
        if (filterLoader) {
          filterLoader.remove();
        }
      });
    });
  });
});

const imageAdjustmentTools = imagePreviewDiv.querySelectorAll(
  ".image_adjustment_tools a"
);

const finalizeCropButton = document.createElement("button");
finalizeCropButton.classList =
  "medium_text download py-1 px-2 m-2 bg-success text-light";
finalizeCropButton.innerText = "Finalize Crop";
finalizeCropButton.style.display = "none"; // hidden initially
filteredImageDiv.insertAdjacentElement("beforeend", finalizeCropButton);

finalizeCropButton.addEventListener("click", () => {
  if (cropper) {
    const cropperContainer = document.querySelector(".cropper-container");
    cropperContainer.remove();

    // get the cropped canvas from the CropperJS instance
    const croppedCanvas = cropper.getCroppedCanvas();
    croppedCanvas.id = "canvas";
    filteredImageDiv.replaceChild(croppedCanvas, canvas);
    finalizeCropButton.style.display = "none";
  }
});

let cropper = null;
let rotationDegrees = 0;
if (imagePreviewDiv) {
  imageAdjustmentTools.forEach((tool) => {
    tool.addEventListener("click", (e) => {
      if (e.target.id === "crop") {
        cropper = new Cropper(canvas, {
          aspectRatio: 0,
          viewMode: 0,
        });
        finalizeCropButton.style.display = "block"; // show when crop selected
      } else if (e.target.id === "rotate_left") {
        if (cropper) {
          cropper.rotate(-90); // Rotate counterclockwise by 90 degrees
        } else {
          // Rotate the canvas directly if no crop is selected
          rotateCanvas(-90);
        }
      } else if (e.target.id === "rotate_right") {
        if (cropper) {
          cropper.rotate(90); // Rotate clockwise by 90 degrees
        } else {
          // Rotate the canvas directly if no crop is selected
          rotateCanvas(90);
        }
      }
    });
  });
}

function rotateCanvas(degrees) {
  rotationDegrees += degrees;
  rotationDegrees %= 360; // Keep rotation within 0 to 359 degrees

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotationDegrees * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

downloadBtn.addEventListener("click", () => {
  const slicedFileName = fileName.split(".")[0];
  const zip = new JSZip();

  const canvasBlob = document.querySelector("#canvas").toBlob(async (blob) => {
    zip.file(`${slicedFileName}.png`, blob);

    // generate the ZIP file asynchronously
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // create a download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "MediaCraft PRO Filtered Image.zip";
    link.click();
  }, "image/png");
});

resetBtn.addEventListener("click", () => {
  Caman("#canvas", img, function () {
    this.revert();
    filterControls.forEach((control) => {
      control.value = 0;
      const sliderValueSpan = control.nextElementSibling;
      sliderValueSpan.innerHTML = "0";
    });
  });
  alert("Filter reset. Photo back to normal!");
});

restartBtn.addEventListener("click", () => {
  const confirmRestart = confirm(
    "Are you sure you want to restart? You may lose your progress!"
  );
  if (confirmRestart) {
    location.reload();
  } else {
    return;
  }
});
