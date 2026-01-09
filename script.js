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
   3. MODÁLNÍ OKNO + ZOOM (ULTIMÁTNÍ VERZE)
   ========================================= */
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const container = document.getElementById('modal-image-container');
const loader = document.getElementById('modalLoader');
const binaryCont = document.getElementById("modal-binary");

// Proměnné pro zoom a posun
let scale = 1;
let pannedX = 0;
let pannedY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let modalInterval; 

// --- 1. OTEVŘENÍ OKNA (S loaderem) ---
function openModal(src) {
    // Reset stavu
    scale = 1;
    pannedX = 0;
    pannedY = 0;
    updateTransform();
    
    modal.style.display = "flex";
    modalImg.style.display = "none"; // Schováme obrázek
    loader.style.display = "block";  // Ukážeme loader
    
    // Binární efekt (tvůj kód)
    if (binaryCont) {
        clearInterval(modalInterval);
        modalInterval = setInterval(() => {
            // Jednoduchý generátor nul a jedniček
            binaryCont.innerText = Math.random().toString(2).substr(2, 8);
        }, 80);
    }

    // Načtení obrázku
    modalImg.src = src;
    
    modalImg.onload = () => {
        // Malé zpoždění pro efekt
        setTimeout(() => {
            clearInterval(modalInterval);
            loader.style.display = "none";
            modalImg.style.display = "block";
            // Nastavíme kurzor
            container.style.cursor = "grab";
        }, 400);
    };

    modalImg.onerror = () => {
        clearInterval(modalInterval);
        if (binaryCont) {
            binaryCont.innerText = "ERR: FILE NOT FOUND";
            binaryCont.style.color = "red";
        }
    };
}

// --- 2. ZAVŘENÍ OKNA ---
function closeModal() {
    modal.style.display = "none";
    clearInterval(modalInterval);
}

// --- 3. JÁDRO: Aplikace pohybu ---
function updateTransform() {
    modalImg.style.transform = `translate(${pannedX}px, ${pannedY}px) scale(${scale})`;
}

// --- 4. VYLEPŠENÁ HRANICE (Aby obrázek neutekl) ---
function checkBoundaries() {
    // Získáme rozměry kontejneru (okna)
    const rect = container.getBoundingClientRect();
    
    // Získáme rozměry OBRÁZKU po nazoomování
    // Používáme naturalWidth/Height, aby to bylo přesné
    const imgW = modalImg.offsetWidth * scale;
    const imgH = modalImg.offsetHeight * scale;

    // Limit pro osu X
    if (imgW > rect.width) {
        const maxX = (imgW - rect.width) / 2;
        if (pannedX > maxX) pannedX = maxX;
        if (pannedX < -maxX) pannedX = -maxX;
    } else {
        pannedX = 0; // Pokud je obrázek menší než okno, vycentruj ho
    }

    // Limit pro osu Y
    if (imgH > rect.height) {
        const maxY = (imgH - rect.height) / 2;
        if (pannedY > maxY) pannedY = maxY;
        if (pannedY < -maxY) pannedY = -maxY;
    } else {
        pannedY = 0;
    }
}

// --- 5. OVLÁDÁNÍ MYŠÍ (WHEEL + DRAG) ---

if (container) {
    // A) ZOOM KOLEČKEM (Nejlepší pro PC)
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(1, scale + delta), 4); // Min 1x, Max 4x

        scale = newScale;
        
        // Pokud jsme odzoomovali na 100%, resetujeme pozici
        if (scale === 1) {
            pannedX = 0;
            pannedY = 0;
            container.style.cursor = "grab";
        } else {
            container.style.cursor = "grab";
        }
        
        checkBoundaries(); // Zkontrolujeme, jestli zoomem neutekl okraj
        updateTransform();
    });

    // B) ZAČÁTEK TAŽENÍ (Mousedown)
    container.addEventListener('mousedown', (e) => {
        if (scale > 1) { // Táhnout jde jen když je nazoomováno
            isDragging = true;
            startX = e.clientX - pannedX;
            startY = e.clientY - pannedY;
            container.classList.add('grabbing');
            e.preventDefault();
        }
    });

    // C) POHYB MYŠI (Mousemove)
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        pannedX = e.clientX - startX;
        pannedY = e.clientY - startY;

        checkBoundaries(); // Tady hlídáme hranice při posunu
        updateTransform();
    });

    // D) UKONČENÍ TAŽENÍ
    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.classList.remove('grabbing');
    });
    
    // E) DVOJKLIK (Rychlý zoom / reset)
    container.addEventListener('dblclick', (e) => {
        if (scale === 1) {
            scale = 2.5; // Zoom in
        } else {
            scale = 1;   // Reset
            pannedX = 0;
            pannedY = 0;
        }
        updateTransform();
    });
}

// Zavření klávesou ESC
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
});

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
            const duration = 700; 
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
   5. SCROLL REVEAL (Stabilní - One Way)
   ========================================= */
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // 1. Přidáme třídu (ukážeme prvek)
            entry.target.classList.add('show');
            
            // 2. DŮLEŽITÉ: Okamžitě přestaneme tento prvek sledovat
            // Jakmile se jednou ukáže, už s ním nebudeme hýbat.
            observer.unobserve(entry.target);
        }
    });
}, { 
    threshold: 0.15 // Zvýšeno na 15%, aby se ukázal až když je fakt vidět kus
});

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* =========================================
   6. PŘEPÍNAČ DEN / NOC (S detekcí času)
   ========================================= */
const toggleBtn = document.getElementById('theme-toggle');
const toggleIcon = toggleBtn.querySelector('i');
const body = document.body;

// Zjistíme aktuální hodinu u uživatele (0-23)
const currentHour = new Date().getHours();
// Definujeme, co je "den" (např. od 7:00 do 19:00)
const isDayTime = currentHour >= 7 && currentHour < 19;

// Načteme uložené nastavení z minula
const savedTheme = localStorage.getItem('theme');

// --- ROZHODOVACÍ LOGIKA ---
// 1. Pokud je uloženo 'light' -> zapni světlý
// 2. NEBO pokud není uloženo nic A ZÁROVEŇ je den -> zapni světlý
if (savedTheme === 'light' || (!savedTheme && isDayTime)) {
    body.classList.add('light-mode');
    toggleIcon.classList.remove('fa-sun');
    toggleIcon.classList.add('fa-moon');
}

// --- FUNKCE PŘEPÍNÁNÍ TLAČÍTKEM ---
toggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        // Přepli jsme na světlý
        toggleIcon.classList.remove('fa-sun');
        toggleIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light'); // Uložíme volbu navždy
    } else {
        // Přepli jsme na tmavý
        toggleIcon.classList.remove('fa-moon');
        toggleIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark'); // Uložíme volbu navždy
    }
});
/* =========================================
   7. FLASHLIGHT EFEKT
   ========================================= */
const flashlight = document.getElementById('flashlight');

if (flashlight) {
    document.addEventListener('mousemove', (e) => {
        // Získáme souřadnice myši
        const x = e.clientX;
        const y = e.clientY;

        // Pošleme je do CSS jako proměnné
        flashlight.style.setProperty('--x', x + 'px');
        flashlight.style.setProperty('--y', y + 'px');
    });
}
/* =========================================
   8. BACK TO TOP (Logika zobrazení)
   ========================================= */
const toTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) { // Když sjedeme o 500px dolů
        toTopBtn.classList.add('visible');
    } else {
        toTopBtn.classList.remove('visible');
    }
});