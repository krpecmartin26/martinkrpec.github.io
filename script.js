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
    // Čekáme 2.5 sekundy při startu, aby se logo stihlo vykreslit
    setTimeout(hidePreloader, 1800);
});

/* =========================================
   3. MODÁLNÍ OKNO (S opraveným zpožděním)
   ========================================= */
let modalInterval; 

function openModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const loader = document.getElementById("modalLoader");
    const binaryCont = document.getElementById("modal-binary");
    
    // Najdeme SVG v loaderu
    const modalSvg = loader.querySelector('svg');

    // 1. Zobrazit okno a loader
    modal.style.display = "flex";
    loader.style.display = "block";
    modalImg.style.display = "none"; // Obrázek zatím schovat
    
    // 2. RESTART ANIMACE LOGA (Klíčové pro postupné vykreslení)
    if (modalSvg) {
        modalSvg.classList.remove("animate-logo");
        void modalSvg.offsetWidth; // Vynutí překreslení v prohlížeči (tzv. Reflow)
        modalSvg.classList.add("animate-logo");
    }

    // 3. Spustit binární čísla
    if (binaryCont) {
        modalInterval = setInterval(() => {
            binaryCont.innerText = generateBinary(8);
        }, 80);
    }

    // 4. Začít načítat obrázek
    modalImg.src = imgSrc;

    modalImg.onload = function() {
        // Tady přidáváme zpoždění 0.2s (200ms), aby to neprobliklo moc rychle
        setTimeout(() => {
            clearInterval(modalInterval);
            loader.style.display = "none";
            modalImg.style.display = "block";
        }, 400); 
    };

    modalImg.onerror = function() {
        clearInterval(modalInterval);
        if (binaryCont) {
            binaryCont.innerText = "ERROR: FILE NOT FOUND";
            binaryCont.style.color = "#ff4444";
        }
    };
}

function closeModal() {
    clearInterval(modalInterval);
    document.getElementById("imageModal").style.display = "none";
    
    // TOTO JE NOVÉ: Ujistíme se, že se obrázek od-zoomuje
    document.getElementById("modalImg").classList.remove('zoomed');
}
/* =========================================
   LOGIKA PRO MODÁLNÍ OKNO (HOLD TO ZOOM)
   ========================================= */
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");

// 1. Zavírání kliknutím na černé pozadí
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// 2. Zoom držením myši (mousedown/mouseup)
modalImg.addEventListener('mousedown', function(e) {
    e.stopPropagation(); // Aby se nezavřelo okno
    e.preventDefault();  // Aby se obrázek nezačal přetahovat
    this.classList.add('zoomed');
});

modalImg.addEventListener('mouseup', function(e) {
    e.stopPropagation();
    this.classList.remove('zoomed');
});

// 3. Pojistka: Když ujedu myší pryč z obrázku, zrušit zoom
modalImg.addEventListener('mouseleave', function(e) {
    this.classList.remove('zoomed');
});

// 4. Podpora pro dotykové displeje (mobil)
modalImg.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    e.preventDefault(); 
    this.classList.add('zoomed');
});

modalImg.addEventListener('touchend', function(e) {
    e.stopPropagation();
    this.classList.remove('zoomed');
});


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