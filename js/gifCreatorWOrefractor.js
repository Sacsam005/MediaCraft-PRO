import { validateFile, handleDragDropAndUploadEvents } from "./reusable.js";

// dom objects selectors
const selectGIFBtns = document.querySelectorAll(".create_gif");
const fileInputs = document.querySelectorAll(".file_input");
const gifContainer = document.querySelector(".gif_container");
const mediaPreviewDiv = document.getElementById("media_preview_div");
const gifResultContainer = document.createElement("div");
const gifImage = document.createElement("img");

const createGIFBtn = document.createElement("button");
createGIFBtn.classList = "px-3 py-2 m-2 bg-warning text-dark border border-0";
createGIFBtn.innerHTML = "Create GIF";

const downloadBtn = document.createElement("button");
downloadBtn.classList =
  "download px-3 py-2 m-2 bg-success text-light border border-0";
downloadBtn.innerHTML = "Download";

const dragAndDropDiv = document.querySelector(".drag_and_drop_div");
dragAndDropDiv.style.display = "none"; //hide initially

const gifPreviewDiv = document.getElementById("gif_preview_div");
gifPreviewDiv.style.display = "none"; //hide initially

let loadingElement = document.createElement("p");
loadingElement.classList = "text-center";

const gifControlsDiv = document.querySelector("#gif_controls_div");
gifControlsDiv.style.display = "none";
gifControlsDiv.innerHTML = `
<div class="gif_control">
  <label htmlFor="gif_text">GIF Text (Character Limit - <span class="char_count">50</span>)</label>
  <input type="text" id="gif_text" placeholder="Enter text" value="" />
</div>

<div class="gif_control">
  <label htmlFor="gif_width">Enter Width</label>
  <input type="text" id="gif_width" placeholder="Enter value between 100-1000" mode="numeric" value="" class="w-100"/>

  <label htmlFor="gif_height">Enter Height</label>
  <input type="text" id="gif_height" placeholder="Enter value between 100-1000" mode="numeric" value="" class="w-100"/>
</div>

<div class="gif_control">
  <label htmlFor="gif_interval">GIF Interval</label>
  <select name="gif_interval" id="gif_interval">
    <option value="slow">Slow</option>
    <option value="medium">Medium</option>
    <option value="fast">Fast</option>
  </select>
</div>
`;

// gif customizations props
let gifTextValue = "MediaCraft PRO GIF"; // default value
let gifIntervalValue = 0.25; // default value
const gifTextInput = gifControlsDiv.querySelector("#gif_text");
const charCountSpan = gifControlsDiv.querySelector(".char_count");
const gifIntervalInputs = gifControlsDiv.querySelectorAll("#gif_interval");
const gifWidth = gifControlsDiv.querySelector("#gif_width");
const gifHeight = gifControlsDiv.querySelector("#gif_height");
let maxCharacterExceeded = false;

// gif from images
selectGIFBtns[0].addEventListener("click", () => {
  selectGIFBtns.forEach((btn) => {
    btn.remove();
  });
  dragAndDropDiv.style.display = "flex";
  fileInputs[0].style.display = "block";
  fileInputs[0].id = "fileInput";

  async function handleUploadedFiles(uploadedFiles) {
    // file loader
    loadingElement.innerHTML = `${uploadedFiles.length} ${
      uploadedFiles.length > 1 ? "files" : "file"
    } - Loading...`;
    mediaPreviewDiv.insertAdjacentElement("beforebegin", loadingElement);

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

    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
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
          const imgsrc = e.target.result;
          mediaPreviewDiv.innerHTML += `<img src="${imgsrc}" alt="Preview Image" width="40%" class="m-2"/>`;
        };
        reader.readAsDataURL(file);
      }
    }

    dragAndDropDiv.remove();

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

    loadingElement.remove(); // files loader removed
    gifControlsDiv.style.display = "block";
    gifContainer.insertAdjacentElement("afterend", createGIFBtn);

    // get the git text value
    gifTextInput.addEventListener("input", () => {
      const updatedTextValue = getGIFText(
        gifTextValue,
        gifTextInput,
        charCountSpan,
        maxCharacterExceeded
      );
      gifTextValue = updatedTextValue.textValue;
    });

    if (maxCharacterExceeded) {
      return; // exit the function if the character limit was exceeded
    }

    // get gif interval value
    const updatedIntervalValue = getGIFInterval(gifIntervalInputs);
    gifIntervalValue = updatedIntervalValue.intervalValue;
    console.log(gifIntervalValue);

    // create gif
    createGIFBtn.addEventListener("click", () => {
      const dimensions = getGIFDimensions(gifWidth, gifHeight);
      if (dimensions === null) {
        return; // exit the function if dimensions are not provided
      }

      const gifOptions = {
        gifWidth: `${dimensions.width}`,
        gifHeight: `${dimensions.height}`,
        images: [], // push URLs of the images here
        interval: `${gifIntervalValue}`,
        frameDuration: 1, // duration of each frame in seconds
        numFrames: 10,
        text: `${gifTextValue}`,
        fontWeight: "bold",
        fontSize: "16px",
        minFontSize: "10px",
        fontFamily: "sans-serif",
        fontColor: "#e77200",
        textAlign: "center",
        textBaseline: "bottom",
        sampleInterval: 10,
        numWorkers: 2,
      };

      for (const file of uploadedFiles) {
        gifOptions.images.push(URL.createObjectURL(file));
      }

      loadingElement.innerHTML = "GIF Loading..."; // reusing the loader
      gifPreviewDiv.insertAdjacentElement("afterbegin", loadingElement);

      gifshot.createGIF(gifOptions, function (obj) {
        if (!obj.error) {
          gifImage.src = obj.image;
          gifResultContainer.appendChild(gifImage);
          gifPreviewDiv.appendChild(gifResultContainer);
        }
        loadingElement.remove(); // gif loader removed
        gifContainer.insertAdjacentElement("afterend", downloadBtn);
      });

      mediaPreviewDiv.remove();
      createGIFBtn.remove();
      gifControlsDiv.remove();
      gifPreviewDiv.style.display = "block";
    });

    // download gif
    if (downloadBtn) {
      downloadGIF(gifImage);
    }
  }

  handleDragDropAndUploadEvents(fileInputs[0], handleUploadedFiles);
});

// gif from videos
selectGIFBtns[1].addEventListener("click", () => {
  selectGIFBtns.forEach((btn) => {
    btn.remove();
  });
  dragAndDropDiv.style.display = "flex";
  fileInputs[1].style.display = "block";
  fileInputs[1].id = "fileInput";

  async function handleUploadedFiles(uploadedFiles) {
    // file loader
    loadingElement.innerHTML = `${uploadedFiles.length} ${
      uploadedFiles.length > 1 ? "files" : "file"
    } - Loading...`;
    mediaPreviewDiv.insertAdjacentElement("beforebegin", loadingElement);

    const maxVideoFileSize = 10 * 1024 * 1024; // 10MB in bytes
    const supportedVideoTypes = [
      "video/mp4",
      "video/mkv",
      "video/mov",
      "video/quicktime",
      "video/webm",
    ];
    const supportedVideoTypesString = supportedVideoTypes
      .map((type) => type.split("/")[1].toUpperCase())
      .join(", ");

    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        console.log(file.type);

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

        reader.onload = (e) => {
          const videoSrc = e.target.result;
          mediaPreviewDiv.innerHTML += `
            <video class="m-2" width="40%" controls>
              <source src="${videoSrc}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            `;
        };
        reader.readAsDataURL(file);
      }
    }

    dragAndDropDiv.remove();

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

    loadingElement.remove(); // files loader removed
    gifControlsDiv.style.display = "block";
    gifContainer.insertAdjacentElement("afterend", createGIFBtn);

    // get the gif interval value
    gifTextInput.addEventListener("input", () => {
      const updatedTextValue = getGIFText(
        gifTextValue,
        gifTextInput,
        charCountSpan,
        maxCharacterExceeded
      );
      gifTextValue = updatedTextValue.textValue;
    });

    if (maxCharacterExceeded) {
      return; // exit the function if the character limit was exceeded
    }

    // get gif interval value
    const updatedIntervalValue = getGIFInterval(gifIntervalInputs);
    gifIntervalValue = updatedIntervalValue.intervalValue;

    // create gif
    createGIFBtn.addEventListener("click", () => {
      const dimensions = getGIFDimensions(gifWidth, gifHeight);
      if (dimensions === null) {
        return; // exit the function if dimensions are not provided
      }

      const gifOptions = {
        gifWidth: `${dimensions.width}`,
        gifHeight: `${dimensions.height}`,
        video: [], // push URLs of the images here
        keepCameraOn: false,
        interval: `${gifIntervalValue}`,
        frameDuration: 1, // duration of each frame in seconds
        numFrames: 10,
        text: `${gifTextValue}`,
        fontWeight: "bold",
        fontSize: "16px",
        minFontSize: "10px",
        fontFamily: "sans-serif",
        fontColor: "#e77200",
        textAlign: "center",
        textBaseline: "bottom",
        sampleInterval: 10,
        numWorkers: 2,
      };

      for (const file of uploadedFiles) {
        gifOptions.video.push(URL.createObjectURL(file));
      }

      loadingElement.innerHTML = "GIF Loading..."; // reusing the loader
      gifPreviewDiv.insertAdjacentElement("afterbegin", loadingElement);

      gifshot.createGIF(gifOptions, function (obj) {
        if (!obj.error) {
          gifImage.src = obj.image;
          gifResultContainer.appendChild(gifImage);
          gifPreviewDiv.appendChild(gifResultContainer);
        }
        loadingElement.remove(); // gif loader removed
        gifContainer.insertAdjacentElement("afterend", downloadBtn);
      });

      mediaPreviewDiv.remove();
      createGIFBtn.remove();
      gifControlsDiv.remove();
      gifPreviewDiv.style.display = "block";
    });

    // download gif
    if (downloadBtn) {
      downloadGIF(gifImage);
    }

    gifContainer.insertAdjacentElement("afterend", createGIFBtn);
  }
  handleDragDropAndUploadEvents(fileInputs[1], handleUploadedFiles);
});

// -----------------------------------------------------------------------
// function to download GIF
function downloadGIF(gif) {
  downloadBtn.addEventListener("click", async () => {
    const imgBlob = await fetch(gif.src).then((response) => response.blob());
    const zip = new JSZip();
    zip.file(`MediaCraft PRO GIF.gif`, imgBlob);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = "MediaCraft PRO GIF.zip";
    downloadLink.click();
  });
}

// function to get gif text input
function getGIFText(textValue, textInput, countSpan, maxCharacterExceeded) {
  const maxCharLength = 50;
  const userTextLength = textInput.value.length;
  const remainingCharLength = maxCharLength - userTextLength;
  countSpan.textContent = Math.max(remainingCharLength, 0);
  if (textInput.value.trim() !== "") {
    textValue = textInput.value.trim();
  }

  if (userTextLength >= 50) {
    alert("Max character limit reached! Please use 50 characters or less.");
    maxCharacterExceeded = true;
    return;
  }
  return { textValue };
}

// function to get gif interval input
function getGIFInterval(intervalInputs, intervalValue) {
  intervalInputs.forEach((option) => {
    if (option.value === "slow") {
      intervalValue = 0.75;
    } else if (option.value === "medium") {
      intervalValue = 0.5;
    } else if (option.value === "fast") {
      intervalValue = 0.25;
    }
  });
  return { intervalValue };
}

// get gif width and height value
function getGIFDimensions(widthInput, heightInput) {
  const width = widthInput.value.trim();
  const height = heightInput.value.trim();

  if (width === "" || height === "") {
    if (!confirm("Do you want to leave width or height blank?")) {
      return null; // Return null if the user doesn't want to leave them blank
    }
    return { width: 500, height: 500 };
  }

  // check if dimensions are too small or too large
  if (width < 100 || height < 100) {
    gifWidth.value = "";
    gifHeight.value = "";
    alert(
      "GIF dimensions are too small. Please use dimensions greater than 100x100."
    );
    return null;
  }
  if (width > 1000 || height > 1000) {
    gifWidth.value = "";
    gifHeight.value = "";
    alert(
      "GIF dimensions are too large. Please use dimensions smaller than 1000x1000."
    );
    return null;
  }

  return { width, height };
}
