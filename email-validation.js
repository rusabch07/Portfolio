"use strict";

const disposableEmailDomains = [
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "throwawaymail.com"
];

const commonEmailDomainTypos = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com"
};

function validateEmail(value) {
  const email = typeof value === "string" ? value.trim() : "";
  const invalid = (message) => ({ valid: false, message, suggestion: "" });

  if (!email) return invalid("Please enter your email address.");
  if (email.length > 254) return invalid("Email is too long (maximum 254 characters).");
  if (/\s/.test(email)) return invalid("Email contains spaces.");

  const atCount = [...email].filter((character) => character === "@").length;
  if (atCount === 0) return invalid("Missing @.");
  if (atCount !== 1) return invalid("Email must contain exactly one @.");

  const [localPart, rawDomain] = email.split("@");
  const domain = rawDomain.toLowerCase();

  if (!localPart) return invalid("Email name is missing before @.");
  if (!domain) return invalid("Domain looks incomplete.");
  if (localPart.length > 64) return invalid("Email name is too long (maximum 64 characters).");
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return invalid("Email name cannot start or end with a dot.");
  }
  if (localPart.includes("..")) return invalid("Email name cannot contain consecutive dots.");
  if (!/^[A-Za-z0-9._%+-]+$/.test(localPart)) {
    return invalid("Email name contains invalid characters.");
  }

  if (!domain.includes(".") || domain.includes("..")) {
    return invalid("Domain looks incomplete.");
  }

  const labels = domain.split(".");
  if (labels.some((label) => label.length === 0)) {
    return invalid("Domain looks incomplete.");
  }
  if (labels.some((label) => label.length > 63)) {
    return invalid("Domain labels must be 63 characters or fewer.");
  }
  if (labels.some((label) => !/^[A-Za-z0-9-]+$/.test(label))) {
    return invalid("Domain labels may contain only letters, numbers and hyphens.");
  }
  if (labels.some((label) => label.startsWith("-") || label.endsWith("-"))) {
    return invalid("Domain labels cannot start or end with a hyphen.");
  }
  if (!/^[A-Za-z]{2,}$/.test(labels[labels.length - 1])) {
    return invalid("Domain looks incomplete: the ending must be at least two letters.");
  }
  if (disposableEmailDomains.includes(domain)) {
    return invalid("Please use a permanent email address.");
  }

  const suggestedDomain = commonEmailDomainTypos[domain];
  if (suggestedDomain) {
    return {
      valid: false,
      message: `Did you mean ${localPart}@${suggestedDomain}?`,
      suggestion: `${localPart}@${suggestedDomain}`
    };
  }

  if (domain !== "gmail.com") {
    return invalid("Only @gmail.com email addresses are accepted.");
  }

  return { valid: true, message: "", suggestion: "" };
}
