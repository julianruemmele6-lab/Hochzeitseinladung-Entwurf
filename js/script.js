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
  ".photo-frame, .intro, .date-card, .details h2, .timeline-item, .transition-section, .faq-section, .location-card"
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
// =========================
// RSVP Formular
// =========================

const rsvpForm = document.getElementById("rsvpForm");

const attendanceOptions = document.querySelectorAll(
  'input[name="attendance"]'
);

const attendanceDetails =
  document.getElementById("attendanceDetails");

const menuOptions = document.querySelectorAll(
  'input[name="menu"]'
);

const formStatus =
  document.getElementById("formStatus");


// Zusage oder Absage
attendanceOptions.forEach((option) => {

  option.addEventListener("change", () => {

    if (option.value === "yes" && option.checked) {

      attendanceDetails.classList.remove("is-hidden");

      menuOptions.forEach((menu) => {
        menu.required = true;
      });

    }

    if (option.value === "no" && option.checked) {

      attendanceDetails.classList.add("is-hidden");

      menuOptions.forEach((menu) => {
        menu.required = false;
        menu.checked = false;
      });

    }

  });

});


// Formular absenden
rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = rsvpForm.querySelector(".rsvp-submit");

  const formData = new FormData(rsvpForm);

  const data = {
    name: formData.get("name"),
    attendance: formData.get("attendance"),
    menu: formData.get("menu"),
    food: formData.get("food"),
    message: formData.get("message")
  };

  formStatus.textContent = "Deine Antwort wird gespeichert …";

  submitButton.disabled = true;
  submitButton.textContent = "Wird gesendet …";

  try {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Die Antwort konnte nicht gespeichert werden."
      );
    }

    formStatus.textContent =
      "Vielen Dank! Deine Rückmeldung wurde gespeichert. 💜";

    rsvpForm.reset();

    attendanceDetails.classList.remove("is-hidden");

    menuOptions.forEach((menu) => {
      menu.required = false;
    });

  } catch (error) {
    console.error(error);

    formStatus.textContent =
      error.message ||
      "Leider ist etwas schiefgelaufen. Bitte versuche es noch einmal.";

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Antwort senden";
  }
});
