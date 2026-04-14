const sections = [...document.querySelectorAll("[data-section]")];
const navLinks = [...document.querySelectorAll(".deck-nav__link")];
const currentSection = document.querySelector("[data-current-section]");
const totalSections = document.querySelector("[data-total-sections]");

if (totalSections) {
  totalSections.textContent = String(sections.length).padStart(2, "0");
}

const revealSection = (section) => {
  if (!section) {
    return;
  }

  section.classList.add("is-visible");
};

const setActiveSection = (id) => {
  const index = sections.findIndex((section) => section.id === id);

  if (index === -1) {
    return;
  }

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });

  if (currentSection) {
    currentSection.textContent = String(index + 1).padStart(2, "0");
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      revealSection(entry.target);
      setActiveSection(entry.target.id);
    });
  },
  {
    threshold: 0.28,
    rootMargin: "-8% 0px -24% 0px",
  },
);

sections.forEach((section) => {
  revealSection(section);
  observer.observe(section);
});

const getNearestSectionIndex = () => {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const distance = Math.abs(section.getBoundingClientRect().top);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
};

const goToSection = (section) => {
  if (!section) {
    return;
  }

  revealSection(section);
  setActiveSection(section.id);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
};

const initialTarget = window.location.hash
  ? document.querySelector(window.location.hash)
  : sections[0];

if (initialTarget) {
  revealSection(initialTarget);
  setActiveSection(initialTarget.id);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    goToSection(target);
  });
});

document.addEventListener("keydown", (event) => {
  const isInteractive = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
    document.activeElement?.tagName,
  );

  if (isInteractive) {
    return;
  }

  const currentIndex = getNearestSectionIndex();
  let targetIndex = currentIndex;

  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    targetIndex = Math.min(currentIndex + 1, sections.length - 1);
  } else if (["ArrowUp", "PageUp"].includes(event.key)) {
    targetIndex = Math.max(currentIndex - 1, 0);
  } else if (event.key === "Home") {
    targetIndex = 0;
  } else if (event.key === "End") {
    targetIndex = sections.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  goToSection(sections[targetIndex]);
});
