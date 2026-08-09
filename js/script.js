const weddingDate = new Date("2027-07-18T00:00:00");

function updateCountdown() {
  const now = new Date();
  const difference = weddingDate - now;

  const countdown = document.getElementById("countdown");

  if (difference <= 0) {
    countdown.textContent = "Heute ist unser großer Tag! 💚";
    return;
  }

  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

  countdown.textContent = `Noch ${days} Tage`;
}

updateCountdown();
setInterval(updateCountdown, 60 * 60 * 1000);

// Elemente beim Scrollen weich einblenden

const revealElements = document.querySelectorAll(
  ".photo-frame, .intro, .date-card, .details h2, .timeline-item, .transition-section, .location-card"
);

revealElements.forEach((element) => {
  element.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


// Navigation beim Scrollen etwas deutlicher machen

const header = document.querySelector(".site-header");

function updateHeader() {
  if (window.scrollY > 40) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

updateHeader();

window.addEventListener("scroll", updateHeader);
