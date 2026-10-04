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
const contactSubmitButton = contactForm.querySelector('button[type="submit"]');
const submitLabel = contactSubmitButton.querySelector(".submit-label");
const contactEmailAddress = "m.rusabch07@gmail.com";
let contactIsSubmitting = false;
let contactCooldownUntil = 0;

const contactFields = [
  {
    input: contactForm.elements.name,
    error: document.querySelector("#contact-name-error"),
    validate: (value) => ({
      valid: Boolean(value),
      message: value ? "" : "Please enter your name.",
      suggestion: ""
    })
  },
  {
    input: contactForm.elements.email,
    error: document.querySelector("#contact-email-error"),
    validate: validateEmail
  },
  {
    input: contactForm.elements.message,
    error: document.querySelector("#contact-message-error"),
    validate: (value) => ({
      valid: value.length >= 10,
      message: value.length >= 10 ? "" : "Please enter a message of at least 10 characters.",
      suggestion: ""
    })
  }
];

function setContactFieldError(field, validation) {
  field.error.replaceChildren();
  if (validation.suggestion) {
    field.error.append(document.createTextNode("Did you mean "));
    const suggestionLink = document.createElement("a");
    suggestionLink.href = "#contact-email";
    suggestionLink.textContent = validation.suggestion;
    suggestionLink.addEventListener("click", (event) => {
      event.preventDefault();
      field.input.value = validation.suggestion;
      setContactFieldError(field, validateEmail(field.input.value));
      field.input.focus();
    });
    field.error.append(suggestionLink, document.createTextNode("?"));
  } else {
    field.error.textContent = validation.message;
  }
  field.input.setAttribute("aria-invalid", String(!validation.valid));
}

function showContactFailure() {
  formStatus.className = "form-status";
  formStatus.replaceChildren(
    document.createTextNode("Something went wrong. Please try again or email me directly at "),
    Object.assign(document.createElement("a"), {
      href: `mailto:${contactEmailAddress}`,
      textContent: contactEmailAddress
    }),
    document.createTextNode(".")
  );
}

contactFields.forEach((field) => {
  field.input.addEventListener("input", () => {
    if (field.error.textContent) {
      setContactFieldError(field, field.validate(field.input.value.trim()));
    }
  });
});

const emailField = contactFields.find((field) => field.input.name === "email");

emailField.input.addEventListener("blur", () => {
  const trimmedEmail = emailField.input.value.trim();
  const atIndex = trimmedEmail.lastIndexOf("@");
  emailField.input.value = atIndex < 0
    ? trimmedEmail
    : `${trimmedEmail.slice(0, atIndex)}@${trimmedEmail.slice(atIndex + 1).toLowerCase()}`;
  setContactFieldError(emailField, validateEmail(emailField.input.value));
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (contactForm.elements.botcheck.checked || contactIsSubmitting || Date.now() < contactCooldownUntil) return;

  const values = {};
  let formIsValid = true;
  let firstInvalidField = null;
  contactFields.forEach((field) => {
    let value = field.input.value.trim();
    if (field === emailField) {
      const atIndex = value.lastIndexOf("@");
      value = atIndex < 0
        ? value
        : `${value.slice(0, atIndex)}@${value.slice(atIndex + 1).toLowerCase()}`;
      field.input.value = value;
    }
    values[field.input.name] = value;
    const validation = field.validate(value);
    setContactFieldError(field, validation);
    if (!validation.valid) {
      formIsValid = false;
      if (!firstInvalidField) firstInvalidField = field.input;
    }
  });
  if (!formIsValid) {
    firstInvalidField.focus();
    return;
  }

  contactIsSubmitting = true;
  contactSubmitButton.disabled = true;
  contactForm.classList.add("is-sending");
  submitLabel.textContent = "Sending...";
  formStatus.className = "form-status";
  formStatus.textContent = "Sending your message...";

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: contactForm.dataset.accessKey,
        ...values,
        subject: "New message from portfolio website",
        from_name: "Portfolio Contact Form",
        botcheck: ""
      })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "The contact form submission failed.");
    }

    contactForm.reset();
    contactFields.forEach((field) => setContactFieldError(field, ""));
    formStatus.className = "form-status is-success";
    formStatus.textContent = "Thanks! Your message has been sent. I'll reply soon.";
    contactCooldownUntil = Date.now() + 10000;
    window.setTimeout(() => {
      contactCooldownUntil = 0;
      contactSubmitButton.disabled = false;
    }, 10000);
  } catch {
    showContactFailure();
  } finally {
    contactIsSubmitting = false;
    contactForm.classList.remove("is-sending");
    submitLabel.textContent = "Send Message";
    if (Date.now() >= contactCooldownUntil) contactSubmitButton.disabled = false;
  }
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
