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

/**
 * Parse a .journey file into structured data
 */
function parseJourney(text) {
    const lines = text.split('\n');
    const meta = {};
    const waypoints = [];
    let current = null;
    let inWaypoints = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ') && !meta.title) {
            meta.title = trimmed.slice(2);
            continue;
        }
        if (trimmed.startsWith('**Description:**')) {
            meta.description = trimmed.replace('**Description:**', '').trim();
            continue;
        }
        if (trimmed.startsWith('**Category:**')) {
            meta.category = trimmed.replace('**Category:**', '').trim();
            continue;
        }
        if (trimmed.startsWith('**Character:**')) {
            meta.character = trimmed.replace('**Character:**', '').trim();
            continue;
        }
        if (trimmed.startsWith('**Color:**')) {
            meta.color = trimmed.replace('**Color:**', '').trim();
            continue;
        }
        if (trimmed.startsWith('**Theme:**')) {
            meta.theme = trimmed.replace('**Theme:**', '').trim();
            continue;
        }

        if (trimmed === '## Waypoints') {
            inWaypoints = true;
            continue;
        }

        if (!inWaypoints) continue;

        if (trimmed.startsWith('### ')) {
            if (current) waypoints.push(current);
            current = { name: trimmed.slice(4), text: '' };
            continue;
        }

        if (!current) continue;

        if (trimmed.startsWith('📏')) {
            const match = trimmed.match(/(\d+)m/);
            if (match) current.distanceMeters = parseInt(match[1]);
            continue;
        }

        if (trimmed.startsWith('📍')) {
            const coords = trimmed.replace('📍', '').trim().split(',').map(s => parseFloat(s.trim()));
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                current.lat = coords[0];
                current.lng = coords[1];
            }
            continue;
        }

        if (trimmed === '---' || trimmed === '') continue;

        current.text += (current.text ? ' ' : '') + trimmed;
    }
    if (current) waypoints.push(current);

    return { meta, waypoints };
}

/**
 * Format distance for display based on current toggle
 */
function formatDistance(meters) {
    const toggle = document.getElementById('distance-toggle');
    const showKm = toggle && toggle.checked;
    const km = meters / 1000;
    if (showKm) {
        return km.toFixed(1) + ' km';
    }
    return (km * 0.621371).toFixed(1) + ' mi';
}

/**
 * Theme data for map rendering (mirrors build page / StoryTheme in iOS app)
 */
const PREVIEW_THEMES = {
    gothic:    { prefersDarkMap: true,  lineWidth: 4,   opacity: 0.9,  dashArray: '6, 4',       glowWidth: 10, glowOpacity: 0.15, tintOpacity: 0,    tintRGB: [20, 0, 40],  icons: { start: '\u{1F319}', finish: '\u{1F525}' } },
    adventure: { prefersDarkMap: false, lineWidth: 3,   opacity: 0.9,  dashArray: '6, 4',       glowWidth: 0,  glowOpacity: 0,    tintOpacity: 0.08, tintRGB: [80, 60, 20], icons: { start: '\u{1F6A9}', finish: '\u{1F3C1}' } },
    epic:      { prefersDarkMap: false, lineWidth: 5,   opacity: 0.9,  dashArray: '4, 3',       glowWidth: 0,  glowOpacity: 0,    tintOpacity: 0.12, tintRGB: [60, 30, 0],  icons: { start: '\u{1F6E1}', finish: '\u{1F451}' } },
    dramatic:  { prefersDarkMap: true,  lineWidth: 4,   opacity: 0.95, dashArray: '8, 4, 2, 4', glowWidth: 0,  glowOpacity: 0,    tintOpacity: 0,    tintRGB: [40, 0, 0],   icons: { start: '\u{1F3AD}', finish: '\u{1F451}' } },
    mystical:  { prefersDarkMap: false, lineWidth: 3.5, opacity: 0.9,  dashArray: '3, 5',       glowWidth: 9,  glowOpacity: 0.18, tintOpacity: 0.14, tintRGB: [40, 0, 80],  icons: { start: '\u{1FA84}', finish: '\u{1F3DB}' } },
    survival:  { prefersDarkMap: true,  lineWidth: 3,   opacity: 0.95, dashArray: '2, 2',       glowWidth: 0,  glowOpacity: 0,    tintOpacity: 0,    tintRGB: [40, 40, 20], icons: { start: '\u{1F52D}', finish: '\u{1F3AF}' } },
};

let previewMap = null;
let previewJourneyData = null;

/**
 * Fetch and preview a quest journey file in a modal
 */
async function previewQuest(filename) {
    const overlay = document.getElementById('preview-modal');
    const modal = overlay.querySelector('.preview-modal');
    const title = document.getElementById('preview-modal-title');
    const metaEl = document.getElementById('preview-modal-meta');
    const body = document.getElementById('preview-modal-body');
    const mapPanel = document.getElementById('preview-modal-map');

    // Reset to waypoints tab
    switchPreviewTab('waypoints');

    body.innerHTML = '<p class="preview-loading">Loading journey...</p>';
    title.textContent = '';
    metaEl.textContent = '';
    modal.className = 'preview-modal';
    previewJourneyData = null;
    destroyPreviewMap();
    overlay.classList.add('active');

    try {
        const baseUrl = window.location.origin || 'https://footnotes.keithadair.com';
        const response = await fetch(`${baseUrl}/journeys/${filename}`);
        const text = await response.text();
        const journey = parseJourney(text);
        previewJourneyData = journey;

        title.textContent = journey.meta.title || filename;
        metaEl.textContent = [journey.meta.character, journey.meta.category].filter(Boolean).join(' \u2022 ');

        if (journey.meta.theme) {
            modal.classList.add('theme-' + journey.meta.theme);
        }

        body.innerHTML = journey.waypoints.map(wp => {
            const escapedName = wp.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const escapedText = wp.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `
                <div class="preview-waypoint">
                    <div class="preview-waypoint-name">${escapedName}</div>
                    ${wp.distanceMeters ? `<div class="preview-waypoint-distance">${formatDistance(wp.distanceMeters)} to next waypoint</div>` : ''}
                    <p class="preview-waypoint-excerpt">${escapedText}</p>
                </div>
            `;
        }).join('');
    } catch (e) {
        body.innerHTML = '<p class="preview-loading">Failed to load journey.</p>';
    }
}

/**
 * Switch between waypoints and map tabs
 */
function switchPreviewTab(tab) {
    const body = document.getElementById('preview-modal-body');
    const mapPanel = document.getElementById('preview-modal-map');
    const tabs = document.querySelectorAll('.preview-tab');

    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

    if (tab === 'waypoints') {
        body.style.display = '';
        mapPanel.classList.remove('active');
    } else {
        body.style.display = 'none';
        mapPanel.classList.add('active');
        // Initialize map on first switch
        if (!previewMap && previewJourneyData) {
            setTimeout(() => initPreviewMap(previewJourneyData), 50);
        } else if (previewMap) {
            setTimeout(() => previewMap.invalidateSize(), 50);
        }
    }
}

/**
 * Initialize the Leaflet map for previewing a journey
 */
function initPreviewMap(journey) {
    if (typeof L === 'undefined') return;

    const mapContainer = document.getElementById('preview-modal-map');
    mapContainer.innerHTML = '<div id="preview-leaflet-map" class="preview-map-container"></div>';

    const coords = journey.waypoints
        .filter(wp => wp.lat != null && wp.lng != null)
        .map(wp => [wp.lat, wp.lng]);

    if (coords.length === 0) {
        mapContainer.innerHTML = '<p class="preview-loading">No coordinates available for this journey.</p>';
        return;
    }

    const themeName = journey.meta.theme || 'adventure';
    const theme = PREVIEW_THEMES[themeName] || PREVIEW_THEMES.adventure;
    const color = journey.meta.color || '#8B4513';

    previewMap = L.map('preview-leaflet-map', {
        zoomControl: true,
        attributionControl: true
    });

    // Tile layer based on theme
    const tileUrl = theme.prefersDarkMap
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileAttr = theme.prefersDarkMap
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    L.tileLayer(tileUrl, { attribution: tileAttr, maxZoom: 19 }).addTo(previewMap);

    // Tint overlay
    if (theme.tintOpacity > 0) {
        L.rectangle([[-90, -180], [90, 180]], {
            stroke: false,
            fillColor: 'rgb(' + theme.tintRGB.join(',') + ')',
            fillOpacity: theme.tintOpacity,
            interactive: false
        }).addTo(previewMap);
    }

    // Glow polyline
    if (theme.glowWidth > 0 && theme.glowOpacity > 0) {
        L.polyline(coords, {
            color: color,
            weight: theme.glowWidth,
            opacity: theme.glowOpacity,
            dashArray: null
        }).addTo(previewMap);
    }

    // Route polyline
    L.polyline(coords, {
        color: color,
        weight: theme.lineWidth,
        opacity: theme.opacity,
        dashArray: theme.dashArray
    }).addTo(previewMap);

    // Markers
    const waypointsWithCoords = journey.waypoints.filter(wp => wp.lat != null && wp.lng != null);
    waypointsWithCoords.forEach((wp, i) => {
        const isStart = i === 0;
        const isFinish = i === waypointsWithCoords.length - 1 && waypointsWithCoords.length > 1;
        let display = i + 1;
        if (isStart && theme.icons.start) display = theme.icons.start;
        else if (isFinish && theme.icons.finish) display = theme.icons.finish;

        const marker = L.marker([wp.lat, wp.lng], {
            icon: L.divIcon({
                className: '',
                html: '<div class="waypoint-marker" style="background:' + color + '">' + display + '</div>',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })
        }).addTo(previewMap);

        marker.bindPopup('<strong>' + wp.name.replace(/</g, '&lt;') + '</strong>');
    });

    // Fit bounds
    previewMap.fitBounds(L.latLngBounds(coords).pad(0.1));
}

/**
 * Destroy the preview map instance
 */
function destroyPreviewMap() {
    if (previewMap) {
        previewMap.remove();
        previewMap = null;
    }
    const mapPanel = document.getElementById('preview-modal-map');
    if (mapPanel) mapPanel.innerHTML = '';
}

/**
 * Hide the preview modal
 */
function hidePreviewModal() {
    const overlay = document.getElementById('preview-modal');
    if (overlay) overlay.classList.remove('active');
    destroyPreviewMap();
    previewJourneyData = null;
}

/**
 * Initialize preview modal behavior (click outside, Escape)
 */
function initPreviewModal() {
    const overlay = document.getElementById('preview-modal');
    if (!overlay) return;

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hidePreviewModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            hidePreviewModal();
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPlatformUI();
    initModalBehavior();
    initScreenshotCarousel();
    initDistanceToggle();
    initPreviewModal();
});
