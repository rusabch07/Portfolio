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

const skillCards = [...document.querySelectorAll("#skills .skill-card")];

function showSkillProgress(card, percent) {
  card.querySelector(".skill-percentage").textContent = `${percent}%`;
  card.querySelector(".skill-progress").setAttribute("aria-valuenow", String(percent));
  card.querySelector(".skill-progress-fill").animate(
    [{ width: `${percent}%` }],
    { duration: 0, fill: "forwards" }
  );
}

if (reducedMotion) {
  skillCards.forEach((card) => showSkillProgress(card, Number(card.dataset.percent)));
} else {
  const skillsSection = document.querySelector("#skills");
  const skillsObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();

    skillCards.forEach((card) => {
      const percent = Number(card.dataset.percent);
      const percentageText = card.querySelector(".skill-percentage");
      const progressBar = card.querySelector(".skill-progress");
      const progressFill = card.querySelector(".skill-progress-fill");
      const startedAt = performance.now();

      progressFill.animate(
        [{ width: "0%" }, { width: `${percent}%` }],
        { duration: 1000, easing: "ease-out", fill: "forwards" }
      );

      function updatePercentage(now) {
        const progress = Math.min((now - startedAt) / 1000, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const currentPercent = progress === 1 ? percent : Math.round(percent * easedProgress);
        percentageText.textContent = `${currentPercent}%`;
        progressBar.setAttribute("aria-valuenow", String(currentPercent));

        if (progress < 1) requestAnimationFrame(updatePercentage);
      }

      requestAnimationFrame(updatePercentage);
    });
  }, { threshold: 0.15 });

  skillsObserver.observe(skillsSection);
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

const copyContactStatus = document.querySelector("#copy-contact-status");

async function copyContactValue(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      const fallback = document.createElement("textarea");
      fallback.value = value;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.append(fallback);
      fallback.select();
      const copied = document.execCommand("copy");
      fallback.remove();
      if (copied) return;
      throw error;
    }
  }

  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  if (!copied) throw new Error("Clipboard access is unavailable.");
}

document.querySelectorAll(".copy-contact").forEach((button) => {
  button.addEventListener("click", async () => {
    const label = button.dataset.copyLabel;
    try {
      await copyContactValue(button.dataset.copyValue);
      copyContactStatus.textContent = `${label} copied to clipboard.`;
      button.classList.add("is-copied");
      button.setAttribute("aria-label", `${label} copied`);
      button.title = `${label} copied`;
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        button.setAttribute("aria-label", `Copy ${label}`);
        button.title = `Copy ${label}`;
      }, 1600);
    } catch {
      copyContactStatus.textContent = `Could not copy ${label}. Please select and copy it manually.`;
      button.setAttribute("aria-label", `Could not copy ${label}`);
      button.title = `Could not copy ${label}`;
    }
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
