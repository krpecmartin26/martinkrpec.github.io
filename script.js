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
    const rect = zoomContainer.getBoundingClientRect();
    const contentWidth = rect.width * scale;
    const contentHeight = rect.height * scale;

    // 1. Osa X (Vodorovně)
    if (contentWidth > rect.width) {
        // Pokud je obrázek širší než okno -> Povolit posun, ale jen k okrajům
        if (pannedX > 0) pannedX = 0; // Levý okraj
        if (pannedX < rect.width - contentWidth) pannedX = rect.width - contentWidth; // Pravý okraj
    } else {
        // Pokud je obrázek užší než okno -> Vycentrovat ho
        pannedX = (rect.width - contentWidth) / 2;
    }
    
    // 2. Osa Y (Svisle)
    if (contentHeight > rect.height) {
        // Pokud je obrázek vyšší než okno -> Povolit posun, ale jen k okrajům
        if (pannedY > 0) pannedY = 0; // Horní okraj
        if (pannedY < rect.height - contentHeight) pannedY = rect.height - contentHeight; // Spodní okraj
    } else {
        // Pokud je obrázek nižší než okno -> Vycentrovat ho
        pannedY = (rect.height - contentHeight) / 2;
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
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(current)) {
            item.classList.add('active');
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const targetPosition = targetElement.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1500;
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
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