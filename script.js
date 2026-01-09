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
   3. MODÁLNÍ OKNO + ZOOM (FINAL - FAST PAN & CLICK CLOSE)
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

// Logika pro tažení (Drag)
let isDragging = false;
let startMouseX = 0;
let startMouseY = 0;
let startPannedX = 0;
let startPannedY = 0;
let hasMoved = false; // Pojistka: Rozliší kliknutí od tažení

const PAN_SPEED = 1.5; // ZRYCHLENÍ: Obrázek se posouvá 1.5x rychleji než myš
let modalInterval; 

// --- 1. OTEVŘENÍ OKNA ---
function openModal(src) {
    // Reset
    scale = 1;
    pannedX = 0;
    pannedY = 0;
    updateTransform();
    
    modal.style.display = "flex";
    modalImg.style.display = "none";
    loader.style.display = "block";
    
    if (binaryCont) {
        clearInterval(modalInterval);
        modalInterval = setInterval(() => {
            binaryCont.innerText = Math.random().toString(2).substr(2, 8);
        }, 80);
    }

    modalImg.src = src;
    
    modalImg.onload = () => {
        setTimeout(() => {
            clearInterval(modalInterval);
            loader.style.display = "none";
            modalImg.style.display = "block";
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

// --- 3. APLIKACE POHYBU ---
function updateTransform() {
    modalImg.style.transform = `translate(${pannedX}px, ${pannedY}px) scale(${scale})`;
}

// --- 4. HLÍDÁNÍ HRANIC ---
function checkBoundaries() {
    const rect = container.getBoundingClientRect();
    const imgW = modalImg.offsetWidth * scale;
    const imgH = modalImg.offsetHeight * scale;

    // Osa X
    if (imgW > rect.width) {
        const maxX = (imgW - rect.width) / 2;
        if (pannedX > maxX) pannedX = maxX;
        if (pannedX < -maxX) pannedX = -maxX;
    } else {
        pannedX = 0;
    }

    // Osa Y
    if (imgH > rect.height) {
        const maxY = (imgH - rect.height) / 2;
        if (pannedY > maxY) pannedY = maxY;
        if (pannedY < -maxY) pannedY = -maxY;
    } else {
        pannedY = 0;
    }
}

// --- 5. OVLÁDÁNÍ MYŠÍ ---

if (container) {
    // A) ZOOM KOLEČKEM
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(1, scale + delta), 4);
        scale = newScale;
        
        if (scale === 1) {
            pannedX = 0; pannedY = 0;
        }
        checkBoundaries();
        updateTransform();
    });

    // B) ZAČÁTEK TAŽENÍ (Mousedown)
    container.addEventListener('mousedown', (e) => {
        hasMoved = false; // Reset pojistky
        if (scale > 1) {
            isDragging = true;
            // Uložíme startovní pozici myši i obrázku
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startPannedX = pannedX;
            startPannedY = pannedY;
            container.classList.add('grabbing');
            e.preventDefault();
        }
    });

    // C) POHYB MYŠI (Mousemove)
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        hasMoved = true; // Uživatel hýbe myší -> je to tažení, ne klik

        // Vypočítáme rozdíl a vynásobíme rychlostí (PAN_SPEED)
        const deltaX = (e.clientX - startMouseX) * PAN_SPEED;
        const deltaY = (e.clientY - startMouseY) * PAN_SPEED;

        pannedX = startPannedX + deltaX;
        pannedY = startPannedY + deltaY;

        checkBoundaries();
        updateTransform();
    });

    // D) UKONČENÍ TAŽENÍ
    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.classList.remove('grabbing');
    });

    // E) KLIKNUTÍ NA POZADÍ (Zavření)
    container.addEventListener('click', (e) => {
        // Pokud jsme zrovna táhli obrázkem (hasMoved), nechceme zavírat
        if (hasMoved) return;

        // Zavřít jen pokud klikneme na kontejner (černé pozadí), ne na obrázek
        if (e.target === container) {
            closeModal();
        }
    });
    
    // F) DVOJKLIK (Reset / Zoom)
    container.addEventListener('dblclick', (e) => {
        if (scale === 1) {
            scale = 2.5;
        } else {
            scale = 1; pannedX = 0; pannedY = 0;
        }
        updateTransform();
    });
}

// Zavření ESC
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
/* =========================================
   9. MOBILNÍ MENU & SCROLL SPY (NOVÉ)
   ========================================= */
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

// 1. Otevírání menu na mobilu
if (hamburger) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
}

// 2. Zavření menu po kliknutí na odkaz
if (navLinks) {
    navLinks.forEach(n => n.addEventListener("click", () => {
        if(hamburger) hamburger.classList.remove("active");
        if(navMenu) navMenu.classList.remove("active");
    }));
}

// 3. SCROLL SPY (Zvýrazňování v menu při scrollování)
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
    let current = "";
    
    // Zjistíme, která sekce je na obrazovce
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Offset -150px, aby se odkaz přepnul trochu dřív, než sekce vyjede úplně nahoru
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute("id");
        }
    });

    // Obarvíme příslušný odkaz
    navLinks.forEach((link) => {
        link.classList.remove("active");
        // Pokud href odkazu obsahuje ID sekce (např #about obsahuje about)
        if (link.getAttribute("href").includes(current)) {
            link.classList.add("active");
        }
    });
});