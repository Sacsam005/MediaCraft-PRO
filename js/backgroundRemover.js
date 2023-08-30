import { validateFile, handleDragDropAndUploadEvents } from "../js/reusable.js";

// dom selectors
const popupCautionModal = document.querySelector(".popup_caution_modal");
const closePopUpBtn = document.querySelector(".close_btn");
popupCautionModal.classList.add("hidden");

const fileInput = document.getElementById("fileInput");
const fileListDiv = document.querySelector(".file_list_div");
const fileList = document.createElement("ol");
fileList.className = "file_list";

const imagePreviewDiv = document.createElement("div");
imagePreviewDiv.classList = "image_preview_div";

const imagePreviewBeforeBgRemoved = document.createElement("div");
imagePreviewBeforeBgRemoved.classList = "image_preview_before";
const imagePreviewAfterBgRemoved = document.createElement("div");
imagePreviewAfterBgRemoved.classList = "image_preview_after";

imagePreviewDiv.appendChild(imagePreviewBeforeBgRemoved);
imagePreviewDiv.insertAdjacentElement("beforeend", imagePreviewAfterBgRemoved);

// popup modal
if (popupCautionModal) {
  // Initially hide the popup
  popupCautionModal.classList.add("hidden");
  document.body.style.overflowY = "hidden";
  popupCautionModal.style.overflowY = "scroll";

  // Show the popup after 2 seconds
  setTimeout(() => {
    popupCautionModal.classList.remove("hidden");
    popupCautionModal.classList.add("visible");
    popupCautionModal.style.overflowY = "scroll";
  }, 1500);

  closePopUpBtn.addEventListener("click", () => {
    popupCautionModal.remove();
    document.body.style.overflowY = "auto";
  });
}

async function handleUploadedFiles(uploadedFiles) {
  const loadingElement = document.createElement("p");
  loadingElement.innerHTML = `<p class="text-center">${uploadedFiles.length} ${
    uploadedFiles.length > 1 ? "files" : "file"
  } - Loading...</p>`;

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

      const formData = new FormData();
      formData.append("image_file", file); // append the actual File object
      formData.append("size", "full");

      const deCipheredKeys = getDeCipheredKey();
      const mainKey =
        deCipheredKeys.k1 +
        deCipheredKeys.k2 +
        deCipheredKeys.k3 +
        deCipheredKeys.k4;

      try {
        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": mainKey,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to remove background");
        }

        const blob = await response.blob();

        const imgUrlBefore = URL.createObjectURL(file);
        imagePreviewBeforeBgRemoved.innerHTML += `<p class="text-center">BEFORE</p><img src="${imgUrlBefore}" alt="Image Preview Before" />`;

        const imgUrlAfter = URL.createObjectURL(blob);
        imagePreviewAfterBgRemoved.innerHTML += `<p class="text-center">AFTER</p><img src="${imgUrlAfter}" alt="Image Preview After" />`;

        imagePreviewDiv.insertAdjacentElement(
          "afterbegin",
          imagePreviewBeforeBgRemoved
        );
        imagePreviewDiv.insertAdjacentElement(
          "beforeend",
          imagePreviewAfterBgRemoved
        );

        fileListDiv.insertAdjacentElement("afterbegin", imagePreviewDiv);

        const downloadBtn = document.createElement("a");
        downloadBtn.classList = "download p-2";
        downloadBtn.href = imgUrlAfter;
        downloadBtn.download = `${fileName} BG Removed.png`;
        downloadBtn.textContent = "Download Image";
        imagePreviewAfterBgRemoved.insertAdjacentElement(
          "beforeend",
          downloadBtn
        );
      } catch (error) {
        console.error("Error removing background:", error);
      }
    }
    fileListDiv.removeChild(loadingElement);
  }
}

handleDragDropAndUploadEvents(fileInput, handleUploadedFiles);

// ciphering the key
const key1 = "mZsqCE";
const key2 = "UJc5z9";
const key3 = "7nFS4b";
const key4 = "tBtJry";

function reverseKeyChar(key) {
  const reversedKey = key.split("").reverse().join("");
  return reversedKey;
}

function getDeCipheredKey() {
  const k1 = reverseKeyChar(key1);
  const k2 = reverseKeyChar(key2);
  const k3 = reverseKeyChar(key3);
  const k4 = reverseKeyChar(key4);

  return { k1, k2, k3, k4 };
}
