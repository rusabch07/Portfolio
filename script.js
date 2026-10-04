"use strict";

const header = document.querySelector("#site-header");
const menuButton = document.querySelector(".menu-toggle");
const navPanel = document.querySelector("#primary-menu");
const navLinks = [...document.querySelectorAll(".nav-link")];

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  navPanel.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 28);
}, { passive: true });

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) setMenu(false);
});

const typedPrefix = document.querySelector("#typed-prefix");
const typedName = document.querySelector("#typed-name");
const typeCursor = document.querySelector(".type-cursor");
const prefixLine = document.querySelector(".typed-prefix-line");
const nameLine = document.querySelector(".typed-name-line");
const headingPrefix = "Hi, I am Muhammad ";
const headingName = "Rusab Chaudhary";
const headingText = headingPrefix + headingName;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function placeTypeCursor(characterIndex) {
  const activeLine = characterIndex <= headingPrefix.length ? prefixLine : nameLine;
  activeLine.append(typeCursor);
}

if (reducedMotion) {
  typedPrefix.textContent = headingPrefix;
  typedName.textContent = headingName;
  placeTypeCursor(headingText.length);
} else {
  let characterIndex = 0;
  let deleting = false;

  function animateHeading() {
    const visibleText = headingText.slice(0, characterIndex);
    typedPrefix.textContent = visibleText.slice(0, headingPrefix.length);
    typedName.textContent = visibleText.slice(headingPrefix.length);
    placeTypeCursor(characterIndex);

    if (!deleting && characterIndex < headingText.length) {
      characterIndex += 1;
      window.setTimeout(animateHeading, 105);
      return;
    }

    if (!deleting) {
      deleting = true;
      window.setTimeout(animateHeading, 1750);
      return;
    }

    if (characterIndex > 0) {
      characterIndex -= 1;
      window.setTimeout(animateHeading, 60);
      return;
    }

    deleting = false;
    window.setTimeout(animateHeading, 500);
  }

  animateHeading();
}

const observedSections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, {
  rootMargin: "-34% 0px -56% 0px",
  threshold: 0
});

observedSections.forEach((section) => sectionObserver.observe(section));

const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -9%", threshold: 0.1 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll(".detail-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const dialog = document.getElementById(trigger.dataset.dialog);
    if (dialog) dialog.showModal();
  });
});

document.querySelectorAll(".project-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const clickedBackdrop = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (clickedBackdrop) dialog.close();
  });
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const recipient = contactForm.dataset.recipient.trim();
  if (!recipient) {
    formStatus.textContent = "Add your email address to data-recipient in index.html to activate this form.";
    return;
  }

  const formData = new FormData(contactForm);
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  formStatus.textContent = "Opening your email app…";
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
