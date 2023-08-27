const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav");
const anchorLinks = document.querySelectorAll(".nav ul li ul a");

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
menu.addEventListener("click", (e) => {
  if (menu.textContent === "MENU") {
    menu.innerHTML = `<p class="mb-0 text-danger">CLOSE</p>`;
    nav.classList.add("active");
  } else {
    menu.textContent = "MENU";
    nav.classList.remove("active");
  }

  if (
    !e.target.classList.contains("nav") &&
    !e.target.classList.contains("menu")
  ) {
    nav.classList.remove("active");
  }

  anchorLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      menu.textContent = "MENU";
    });
  });
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
        <a href="https://www.linkedin.com/in/sachin-samal005/" style="color: #e77200; font-weight: 700">Sachin Samal</a>
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
          <h4>Browser Compatibility:</h4>
          <p>The tool's efficiency and performance may vary depending on the user's browser, potentially causing inconsistencies in the editing experience.</p>
        </li>
        <li>
          <h4>Limited Features Compared to Desktop Tools:</h4>
          <p>MediaCraft Pro may lack some advanced features present in full-fledged desktop software, limiting its capabilities for professional users.</p>
        </li>
        <li>
          <h4>Dependent on Client Device:</h4>
          <p>Processing speed and quality depend on the user's device specifications, which might lead to varying outcomes.</p>
        </li>
        <li>
          <h4>Security Concerns:</h4>
          <p>Since MediaCraft Pro processes files on the client side, there's a potential risk of malicious scripts targeting user devices. Ensuring the tool's security is crucial.</p>
        </li>
        <li>
          <h4>Resource-Intensive Tasks:</h4>
          <p>Some operations, especially GIF and video processing, may be resource-intensive and might lead to slower performance on less powerful devices.</p>
        </li>
      </ul>

      <p class="mb-0 text-danger px-4"><b>Developer's Note: </b></p>
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
