/* =========================================
   1. POMOCNÉ FUNKCE
   ========================================= */
// Generuje náhodné nuly a jedničky
function generateBinary(length) {
    let text = "";
    for (let i = 0; i < length; i++) {
        text += Math.round(Math.random());
    }
    return text;
}

/* =========================================
   2. PRELOADER (Start webu)
   ========================================= */
const preloaderBinary = document.getElementById('preloader-binary');
let preloaderInterval;

// Spustí animaci čísel hned při načítání scriptu
if (preloaderBinary) {
    preloaderInterval = setInterval(() => {
        preloaderBinary.innerText = generateBinary(12); // Délka řádku 12 znaků
    }, 80);
}

function hidePreloader() {
    const loader = document.getElementById('preloader');
    if (loader) {
        clearInterval(preloaderInterval); // Zastaví čísla
        loader.style.opacity = '0';       // Zprůhlední
        setTimeout(() => {
            loader.style.display = 'none'; // Odstraní z DOMu
        }, 500);
    }
}

// Čekáme na načtení všeho (obrázky, styly)
window.addEventListener('load', () => {
    // Minimálně 2 sekundy necháme logo svítit, ať si ho všimnou
    setTimeout(hidePreloader, 2000);
});

// Pojistka: Kdyby se něco seklo, po 5s zmizí násilím
setTimeout(hidePreloader, 5000);


/* =========================================
   3. MODÁLNÍ OKNO (Certifikáty & Projekty)
   ========================================= */
let modalInterval; 

function openModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const loader = document.getElementById("modalLoader");
    const binaryCont = document.getElementById("modal-binary");
    
    // Najdeme SVG v modálním okně
    const modalSvg = loader.querySelector('svg');

    modal.style.display = "flex";
    loader.style.display = "block";
    modalImg.style.display = "none";
    modalImg.src = imgSrc;

    // RESTART ANIMACE LOGA V MODÁLU
    if (modalSvg) {
        modalSvg.classList.remove("animate-logo"); // Reset
        void modalSvg.offsetWidth; // Vynutí překreslení (trik prohlížeče)
        modalSvg.classList.add("animate-logo");    // Spustí animaci znovu
    }

    // ... zbytek tvého kódu (interval pro čísla, onload atd.) ...
}

function closeModal() {
    clearInterval(modalInterval); // Pro jistotu zastavit interval
    document.getElementById("imageModal").style.display = "none";
}


/* =========================================
   4. SCROLL SPY (Zvýraznění menu) & NAVIGACE
   ========================================= */
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Offset 150px - přepne barvu v menu trochu dřív, než tam dojedeme úplně
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active'); // Zruší modrou u všech
        if (item.getAttribute('href').includes(current)) {
            item.classList.add('active'); // Přidá modrou aktuálnímu
        }
    });
});

// Plynulý scroll po kliknutí na odkaz
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Smooth scroll s vlastní rychlostí
            const targetPosition = targetElement.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1500; // Rychlost scrollu (ms)
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                // Easing funkce (rozjezd-dojezd)
                const run = ease(progress, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (progress < duration) window.requestAnimationFrame(step);
            }

            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            window.requestAnimationFrame(step);
        }
    });
});


/* =========================================
   5. SCROLL REVEAL (Efekt při scrollování)
   ========================================= */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));