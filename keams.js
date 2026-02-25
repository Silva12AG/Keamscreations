// ================= PORTFOLIO SLIDER =================
const track = document.querySelector('.slider-track');
const slides = Array.from(track.children);
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentIndex = 0;

function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * (slides[0].offsetWidth + 20)}px)`;
}

nextBtn.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) currentIndex++;
    else currentIndex = 0;
    updateSlider();
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) currentIndex--;
    else currentIndex = slides.length - 1;
    updateSlider();
});

// ================= SCROLL REVEAL =================
const srElements = document.querySelectorAll('.hero, .about-section, .services-section, .portfolio-section, .contact-section');

window.addEventListener('scroll', () => {
    srElements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (top < windowHeight - 100) {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        } else {
            el.style.opacity = 0;
            el.style.transform = 'translateY(50px)';
        }
    });
});

// Initial state for scroll reveal
srElements.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'all 0.8s ease-out';
});
