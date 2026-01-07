/* =========================================
   1. POMOCNÉ FUNKCE
   ========================================= */
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

if (preloaderBinary) {
    preloaderInterval = setInterval(() => {
        preloaderBinary.innerText = generateBinary(12);
    }, 80);
}

function hidePreloader() {
    const loader = document.getElementById('preloader');
    if (loader) {
        clearInterval(preloaderInterval);
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

window.addEventListener('load', () => {
    setTimeout(hidePreloader, 1800);
});

/* =========================================
   3. MODÁLNÍ OKNO + NOVÝ ZOOM (Logic)
   ========================================= */
let modalInterval; 

// Proměnné pro Zoom a Pan
const zoomContainer = document.getElementById("modal-image-container");
const zoomImg = document.getElementById("modalImg");
const modalWindow = document.getElementById("imageModal");

let scale = 1;
let pannedX = 0;
let pannedY = 0;
let isDragging = false;
let startX, startY;
const ZOOM_LEVEL = 2.5; // Síla přiblížení

// --- OTEVŘENÍ OKNA ---
function openModal(imgSrc) {
    const loader = document.getElementById("modalLoader");
    const binaryCont = document.getElementById("modal-binary");
    const modalSvg = loader.querySelector('svg');

    // 1. Resetovat Zoom při každém otevření
    scale = 1;
    pannedX = 0;
    pannedY = 0;
    updateTransform();
    if(zoomContainer) zoomContainer.style.cursor = "zoom-in";

    // 2. Zobrazit okno a loader
    modalWindow.style.display = "flex";
    loader.style.display = "block";
    zoomImg.style.display = "none";
    
    // Restart animace loga
    if (modalSvg) {
        modalSvg.classList.remove("animate-logo");
        void modalSvg.offsetWidth; 
        modalSvg.classList.add("animate-logo");
    }

    // Binární čísla (efekt)
    if (binaryCont) {
        modalInterval = setInterval(() => {
            binaryCont.innerText = generateBinary(8);
        }, 80);
    }

    // Načtení obrázku
    zoomImg.src = imgSrc;

    zoomImg.onload = function() {
        setTimeout(() => {
            clearInterval(modalInterval);
            loader.style.display = "none";
            zoomImg.style.display = "block";
        }, 400); 
    };

    zoomImg.onerror = function() {
        clearInterval(modalInterval);
        if (binaryCont) {
            binaryCont.innerText = "ERROR: FILE NOT FOUND";
            binaryCont.style.color = "#ff4444";
        }
    };
}

// --- ZAVŘENÍ OKNA ---
function closeModal() {
    clearInterval(modalInterval);
    modalWindow.style.display = "none";
}

// --- JÁDRO ZOOMU (Matematika) ---
function updateTransform() {
    zoomImg.style.transform = `translate(${pannedX}px, ${pannedY}px) scale(${scale})`;
}

function checkBoundaries() {
    const rect = zoomContainer.getBoundingClientRect(); // Rozměry okna
    
    // OPRAVA: Musíme vzít skutečnou šířku obrázku, ne šířku okna
    // zoomImg.offsetWidth je reálná velikost obrázku bez zoomu
    const currentW = zoomImg.offsetWidth * scale;
    const currentH = zoomImg.offsetHeight * scale;

    // --- 1. Osa X (Vodorovně) ---
    if (currentW > rect.width) {
        // Obrázek je širší než okno -> Povolit posun, ale jen po okraje
        // Vypočítáme maximální posun od středu (limit)
        const maxTranslateX = (currentW - rect.width) / 2;

        if (pannedX > maxTranslateX) pannedX = maxTranslateX;   // Levý okraj
        if (pannedX < -maxTranslateX) pannedX = -maxTranslateX; // Pravý okraj
    } else {
        // Obrázek je užší než okno -> Vycentrovat (posun 0)
        pannedX = 0;
    }

    // --- 2. Osa Y (Svisle) ---
    if (currentH > rect.height) {
        // Obrázek je vyšší než okno -> Povolit posun po okraje
        const maxTranslateY = (currentH - rect.height) / 2;

        if (pannedY > maxTranslateY) pannedY = maxTranslateY;   // Horní okraj
        if (pannedY < -maxTranslateY) pannedY = -maxTranslateY; // Spodní okraj
    } else {
        // Obrázek je nižší než okno -> Vycentrovat (posun 0)
        pannedY = 0;
    }
}

// --- EVENT LISTENERS (Ovládání myší) ---

// 1. Zavření kliknutím mimo
modalWindow.addEventListener('click', function(e) {
    if (e.target === modalWindow) {
        closeModal();
    }
});

if (zoomContainer) {
    // 2. Kliknutí (Zoom nebo Start tažení)
    zoomContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();

        if (scale > 1) {
            // Jsme přiblížení -> začínáme táhnout
            isDragging = true;
            startX = e.clientX - pannedX;
            startY = e.clientY - pannedY;
            zoomContainer.classList.add('grabbing');
        } else {
            // Nejsme přiblížení -> ZOOM na bod
            const rect = zoomContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            scale = ZOOM_LEVEL;
            pannedX = x - (x * scale);
            pannedY = y - (y * scale);
            
            zoomContainer.style.cursor = "grab";
            updateTransform();
        }
    });

    // 3. Pohyb myší (Tažení)
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        pannedX = e.clientX - startX;
        pannedY = e.clientY - startY;

        checkBoundaries();
        updateTransform();
    });

    // 4. Puštění myši
    window.addEventListener('mouseup', () => {
        isDragging = false;
        zoomContainer.classList.remove('grabbing');
    });

    // 5. Dvojklik (Reset)
    zoomContainer.addEventListener('dblclick', () => {
        scale = 1;
        pannedX = 0;
        pannedY = 0;
        zoomContainer.style.cursor = "zoom-in";
        updateTransform();
    });
}

/* =========================================
   4. SCROLL SPY & PLYNULÝ SCROLL
   ========================================= */


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const targetPosition = targetElement.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            
            // 1. ZMĚNA: Zkrácení času z 1500 na 1000ms (nebo 800ms pro svižnější web)
            const duration = 1000; 
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                
                // Ošetření, aby animace nepřejela čas (občas to dělalo skoky na konci)
                const timePassed = Math.min(progress, duration);

                const run = ease(timePassed, startPosition, distance, duration);
                window.scrollTo(0, run);
                
                if (progress < duration) window.requestAnimationFrame(step);
            }

            // 2. ZMĚNA: Funkce easeOutCubic
            // Rychlý start, plynulé zpomalování ke konci.
            // Žádné zrychlování uprostřed.
            function ease(t, b, c, d) {
                t /= d;
                t--;
                return c * (t * t * t + 1) + b;
            }

            window.requestAnimationFrame(step);
        }
    });
});
/* =========================================
   5. SCROLL REVEAL
   ========================================= */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));