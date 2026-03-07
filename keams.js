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

/* HERO SECTION */

.hero{
height:100vh;
display:flex;
align-items:center;
justify-content:center;
text-align:center;
position:relative;

background:linear-gradient(
270deg,
#000000,
#001a1a,
#000000,
#001a33
);

background-size:800% 800%;

animation:heroGradient 14s ease infinite;

}

/* animated gradient */

@keyframes heroGradient{

0%{background-position:0% 50%;}
50%{background-position:100% 50%;}
100%{background-position:0% 50%;}

}

/* glow title */

.glow-title{

font-size:48px;
color:#00ffff;

text-shadow:
0 0 10px #00ffff,
0 0 20px #00ffff,
0 0 40px #00ffff;

animation:floatText 4s ease-in-out infinite;

}

/* floating animation */

@keyframes floatText{

0%{transform:translateY(0px);}
50%{transform:translateY(-10px);}
100%{transform:translateY(0px);}

}

.hero-sub{

font-size:20px;
margin-top:15px;
color:#ddd;

opacity:0;
animation:fadeIn 2s forwards;
animation-delay:2s;

}

.hero-btn{

opacity:0;
animation:fadeIn 2s forwards;
animation-delay:3s;

}

/* fade animation */

@keyframes fadeIn{

from{
opacity:0;
transform:translateY(20px);
}

to{
opacity:1;
transform:translateY(0);
}

}

