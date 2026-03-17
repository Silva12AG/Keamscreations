// service selection
function showSelection() {
  let checked = document.querySelectorAll(".service-form input:checked");
  let output = "You selected: ";

  checked.forEach(c => output += c.parentElement.innerText + ", ");

  document.getElementById("selection-output").innerText = output;
}

// form feedback
document.getElementById("contactForm").addEventListener("submit", function() {
  document.getElementById("form-feedback").innerText = "Message sent successfully! ✅";
});

// scroll reveal
window.addEventListener("scroll", () => {
  document.querySelectorAll(".reveal").forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add("active");
    }
  });
});
