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
