// LOGO LOADER
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  setTimeout(() => {
    loader.classList.add("hidden");
  }, 2500); // how long it stays (2.5s)
});

// SLIDER
let index = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(i) {
  slides.forEach((slide, idx) => {
    slide.style.display = idx === i ? "block" : "none";
  });
}

function nextSlide() {
  index = (index + 1) % slides.length;
  showSlide(index);
}

function prevSlide() {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
}

showSlide(index);

// MOBILE MENU
const menuToggle = document.createElement("div");
menuToggle.classList.add("menu-toggle");
menuToggle.innerHTML = "☰";
document.body.appendChild(menuToggle);

const header = document.querySelector("header");

menuToggle.addEventListener("click", () => {
  header.classList.toggle("active");
});

// SMART SERVICE BOOKING
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const service = card.querySelector("h3").innerText;
    window.location.href = "#contact";
    setTimeout(() => {
      document.querySelector("textarea").value = "I want to book: " + service;
    }, 300);
  });
});

// form feedback
document.getElementById("contactForm").addEventListener("submit", function() {
  document.getElementById("form-feedback").innerText = "Message sent successfully! ✅";
});
