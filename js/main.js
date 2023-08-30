const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav");
const anchorLinks = document.querySelectorAll(".nav ul li ul a");
const overlay = document.getElementById("overlay");

// loader
const loader = document.querySelector(".loader");
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    if (loader) {
      loader.remove();
    }
  }
};

// mobile navigation
function openNav() {
  menu.innerHTML = `<p class="mb-0 text-danger">CLOSE</p>`;
  nav.classList.add("active");
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeNav() {
  menu.textContent = "MENU";
  nav.classList.remove("active");
  overlay.style.display = "none";
  document.body.style.overflow = "auto";
}

menu.addEventListener("click", () => {
  if (nav.classList.contains("active")) {
    closeNav();
  } else {
    openNav();
  }
});

anchorLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeNav();
  });
});

document.body.addEventListener("click", (e) => {
  if (
    nav.classList.contains("active") &&
    e.target !== menu &&
    !nav.contains(e.target)
  ) {
    closeNav();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024 && nav.classList.contains("active")) {
    closeNav();
  }
});

// toggle accordion answers
const accordionQuestions = document.querySelectorAll(".accordion_question");

accordionQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const answer = question.nextElementSibling;
    answer.classList.toggle("active_question");
    const chevronIcon = question.querySelector(".fa-chevron-down");
    chevronIcon.classList.toggle("fa-chevron-up");
  });
});

// useless_links
document.querySelectorAll(".useless_link").forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
  });
});

// add footer to all pages
const footer = document.createElement("footer");
footer.classList =
  "d-flex justify-content-center align-items-center flex-column mt-4 p-2 small_text faded_bg";
footer.innerHTML = `
      <p class="mb-0 mt-1 text-center">&copy; 2023 MediaCraft Pro. All rights reserved.</p>
      <p class="mb-0 mt-1 text-center text-decoration-underline user_note"><i class="fas fa-info-circle"></i> For Users</p>
      <a class="mb-0 mt-1 text-center text-decoration-underline dev_note" href="../../Readme.html" target="_blank">
        <img src="../../Images/note.png" alt="For Developers" width="28px" height="28px" />
        For Developers
      </a>
      <p class="mb-2 mt-1 text-center">
        For any issues - Contact
        <a href="https://www.linkedin.com/in/sachin-samal005/" class="gradient_text d-inline">Sachin Samal</a>
      </p>
`;

document.body.insertAdjacentElement("beforeend", footer);

const documentationDiv = document.createElement("div");
documentationDiv.classList = "documentation_div small_text faded_bg";
documentationDiv.innerHTML = `
    <h2 class="text-center mt-2"><strong>MediaCraft Pro Documentation</strong></h2>
    <h3 class="text-center mt-2"><strong>Technical Insights and Considerations</strong></h3>
    <p class="mb-0 hide_documentation_btn text-danger bg-white p-2 small_text">CLOSE</p>

      <ul class="small_text">
        <li>
          <h4 class="gradient_text">Browser Compatibility:</h4>
          <p>The tool's efficiency and performance may vary depending on the user's browser, potentially causing inconsistencies in the editing experience.</p>
        </li>
        <li>
          <h4 class="gradient_text">Limited Features Compared to Desktop Tools:</h4>
          <p>MediaCraft Pro may lack some advanced features present in full-fledged desktop software, limiting its capabilities for professional users.</p>
        </li>
        <li>
          <h4 class="gradient_text">Dependent on Client Device:</h4>
          <p>Processing speed and quality depend on the user's device specifications, which might lead to varying outcomes.</p>
        </li>
        <li>
          <h4 class="gradient_text">Security Concerns:</h4>
          <p>Since MediaCraft Pro processes files on the client side, there's a potential risk of malicious scripts targeting user devices. Ensuring the tool's security is crucial.</p>
        </li>
        <li>
          <h4 class="gradient_text">Resource-Intensive Tasks:</h4>
          <p>Some operations, especially GIF and video processing, may be resource-intensive and might lead to slower performance on less powerful devices.</p>
        </li>
      </ul>

      <p class="gradient_text mb-0 text-danger px-4"><b>Developer's Note: </b></p>
      <p class="px-4">Implementation of client-side video conversion is not feasible due to the complexity and resource-intensive nature of video transcoding. Most modern video formats involve encoding, decoding, and compression techniques that require significant computational power and are typically done on server-side platforms.
      <br><br>
      Processing speed and quality depend on the user's device specifications, which might lead to varying outcomes.</p>
`;

footer.insertAdjacentElement("afterend", documentationDiv);

// show developer's note onclick from footer
if (footer) {
  const showDevNoteBtn = footer.querySelector(".user_note");

  const hideDevNoteBtn = documentationDiv.querySelector(
    ".hide_documentation_btn"
  );
  showDevNoteBtn.addEventListener("click", () => {
    documentationDiv.classList.add("slide_up_documentation");
  });

  hideDevNoteBtn.addEventListener("click", () => {
    documentationDiv.classList.remove("slide_up_documentation");
  });
}
