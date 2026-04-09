const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealElements = [...document.querySelectorAll("[data-reveal]")];
const counters = [...document.querySelectorAll("[data-counter]")];
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const progressBar = document.getElementById("scroll-progress");
const heroVisual = document.querySelector(".hero-visual");

const formatCounter = (value, decimals, prefix, suffix) => {
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${formatted}${suffix}`;
};

const animateCounter = (element) => {
  if (element.dataset.counted === "true") {
    return;
  }

  element.dataset.counted = "true";

  const target = Number(element.dataset.target || "0");
  const decimals = Number(element.dataset.decimals || "0");
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";

  if (reduceMotion) {
    element.textContent = formatCounter(target, decimals, prefix, suffix);
    return;
  }

  const startTime = performance.now();
  const duration = 1400;

  const tick = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;

    element.textContent = formatCounter(value, decimals, prefix, suffix);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      element.textContent = formatCounter(target, decimals, prefix, suffix);
    }
  };

  window.requestAnimationFrame(tick);
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");

      if (entry.target.querySelector("[data-counter]")) {
        entry.target.querySelectorAll("[data-counter]").forEach(animateCounter);
      }

      if (entry.target.matches("[data-counter]")) {
        animateCounter(entry.target);
      }

      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  },
);

revealElements.forEach((element) => revealObserver.observe(element));
counters.forEach((counter) => revealObserver.observe(counter));

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = `${value}%`;
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const targetId = entry.target.getAttribute("id");
      const matchingLink = navLinks.find(
        (link) => link.getAttribute("href") === `#${targetId}`,
      );

      if (!matchingLink) {
        return;
      }

      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove("is-active"));
        matchingLink.classList.add("is-active");
      }
    });
  },
  {
    threshold: 0.38,
  },
);

sections.forEach((section) => sectionObserver.observe(section));

if (heroVisual && !reduceMotion) {
  window.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      heroVisual.style.transform = "";
      return;
    }

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroVisual.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`;
  });
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
