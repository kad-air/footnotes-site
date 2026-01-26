/**
 * Footnotes Landing Page - JavaScript
 * Platform detection and deep link handling
 */

/**
 * Detect if the user is on iOS (iPhone, iPad, iPod)
 * Also handles iPad in desktop mode (which reports as MacIntel with touch)
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect if user is on any mobile device
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Open a quest in the Footnotes iOS app via deep link
 * @param {string} filename - The journey filename (e.g., 'lotr_shire_to_bree.journey')
 */
function openQuest(filename) {
    const baseUrl = window.location.origin || 'https://footnotes.keithadair.com';
    const fileUrl = `${baseUrl}/journeys/${filename}`;
    const deepLink = `footnotes://import?url=${encodeURIComponent(fileUrl)}`;

    // Attempt to open the app
    window.location.href = deepLink;

    // Fallback: If app doesn't open within 2.5 seconds, show prompt
    setTimeout(() => {
        // Check if the page is still visible (app didn't open and take focus)
        if (document.visibilityState !== 'hidden') {
            showAppStoreModal();
        }
    }, 2500);
}

/**
 * Show the App Store download modal
 */
function showAppStoreModal() {
    const overlay = document.getElementById('app-store-modal');
    if (overlay) {
        overlay.classList.add('active');
    }
}

/**
 * Hide the App Store download modal
 */
function hideAppStoreModal() {
    const overlay = document.getElementById('app-store-modal');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * Initialize platform-specific UI on page load
 */
function initPlatformUI() {
    const isIOSDevice = isIOS();

    // Update iOS notice banner visibility
    const iosNotice = document.getElementById('ios-notice');
    if (iosNotice) {
        if (isIOSDevice) {
            iosNotice.classList.add('hidden');
        } else {
            iosNotice.classList.remove('hidden');
        }
    }

    // Update quest card buttons
    const questButtons = document.querySelectorAll('.quest-card-button');
    questButtons.forEach(button => {
        if (!isIOSDevice) {
            button.textContent = 'iOS Only';
            button.classList.remove('btn-primary');
            button.classList.add('btn-disabled');
            button.removeAttribute('onclick');
            button.style.cursor = 'not-allowed';
        }
    });

    // Update platform notice on landing page
    const platformNotice = document.getElementById('platform-notice');
    if (platformNotice && !isIOSDevice) {
        platformNotice.textContent = 'Currently available for iPhone only';
    }
}

/**
 * Close modal when clicking outside
 */
function initModalBehavior() {
    const overlay = document.getElementById('app-store-modal');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideAppStoreModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideAppStoreModal();
            }
        });
    }
}

/**
 * Screenshot carousel functionality
 */
let currentScreenshot = 0;
const totalScreenshots = 4;

function initScreenshotCarousel() {
    const track = document.getElementById('screenshot-track');
    const dotsContainer = document.getElementById('screenshot-dots');

    if (!track || !dotsContainer) return;

    // Create dots
    for (let i = 0; i < totalScreenshots; i++) {
        const dot = document.createElement('span');
        dot.className = 'screenshot-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => scrollToScreenshot(i);
        dotsContainer.appendChild(dot);
    }

    // Update dots on scroll
    track.addEventListener('scroll', () => {
        const slideWidth = track.querySelector('.screenshot-slide').offsetWidth + 24; // gap
        const newIndex = Math.round(track.scrollLeft / slideWidth);
        if (newIndex !== currentScreenshot && newIndex >= 0 && newIndex < totalScreenshots) {
            currentScreenshot = newIndex;
            updateDots();
        }
    });
}

function scrollScreenshots(direction) {
    const track = document.getElementById('screenshot-track');
    if (!track) return;

    currentScreenshot = Math.max(0, Math.min(totalScreenshots - 1, currentScreenshot + direction));
    scrollToScreenshot(currentScreenshot);
}

function scrollToScreenshot(index) {
    const track = document.getElementById('screenshot-track');
    if (!track) return;

    const slides = track.querySelectorAll('.screenshot-slide');
    if (slides[index]) {
        slides[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        currentScreenshot = index;
        updateDots();
    }
}

function updateDots() {
    const dots = document.querySelectorAll('.screenshot-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentScreenshot);
    });
}

/**
 * Distance toggle functionality (miles/km)
 */
function initDistanceToggle() {
    const toggle = document.getElementById('distance-toggle');
    if (!toggle) return;

    // Get saved preference or default to miles (unchecked = miles)
    const savedUnit = localStorage.getItem('distance-unit');
    if (savedUnit === 'km') {
        toggle.checked = true;
    }

    // Update distances on toggle
    toggle.addEventListener('change', () => {
        updateAllDistances(toggle.checked);
        localStorage.setItem('distance-unit', toggle.checked ? 'km' : 'miles');
    });

    // Apply initial units
    updateAllDistances(toggle.checked);
}

/**
 * Update all distance displays based on selected unit
 * @param {boolean} showKm - true for km, false for miles
 */
function updateAllDistances(showKm) {
    const distances = document.querySelectorAll('.quest-distance');
    distances.forEach(element => {
        const km = parseFloat(element.getAttribute('data-km'));
        if (!isNaN(km)) {
            if (showKm) {
                element.textContent = km.toFixed(1) + ' km';
            } else {
                const miles = (km * 0.621371).toFixed(1);
                element.textContent = miles + ' mi';
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPlatformUI();
    initModalBehavior();
    initScreenshotCarousel();
    initDistanceToggle();
});
