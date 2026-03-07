/* PORTFOLIO SLIDER */

let slideIndex = 0;

const slides = document.querySelectorAll(".slide");

function showSlide(index) {

    slides.forEach(slide => slide.style.display = "none");

    slides[index].style.display = "block";

}

function nextSlide() {

    slideIndex++;

    if (slideIndex >= slides.length) {

        slideIndex = 0;

    }

    showSlide(slideIndex);

}

function prevSlide() {

    slideIndex--;

    if (slideIndex < 0) {

        slideIndex = slides.length - 1;

    }

    showSlide(slideIndex);

}

showSlide(slideIndex);

setInterval(nextSlide, 4000);


/* SCROLL REVEAL */

function reveal() {

    let reveals = document.querySelectorAll(".reveal");

    for (let i = 0; i < reveals.length; i++) {

        let windowHeight = window.innerHeight;

        let elementTop = reveals[i].getBoundingClientRect().top;

        let elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {

            reveals[i].classList.add("active");

        }

    }

}

window.addEventListener("scroll", reveal);
