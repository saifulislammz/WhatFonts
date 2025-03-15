let isEnabled = true;
let fontInfoCard = null;
let currentHighlightedElement = null;
let copyTimeout;

// Initialize state and card
function initializeState() {
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
        isEnabled = response.isEnabled;
        if (isEnabled) {
            initializeFontInspector();
        } else {
            cleanupFontInspector();
        }
    });
}

// Create and setup font info card
function createFontInfoCard() {
    const card = document.createElement('div');
    card.className = 'font-info-card';
    card.innerHTML = `
        <div class="card-header">
            <div class="header-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17,8H20V20H21V21H17V20H18V17H14L12.5,20H14V21H10V20H11L17,8M18,9L14.5,16H18V9M5,3H10C11.11,3 12,3.89 12,5V16H9V11H6V16H3V5C3,3.89 3.89,3 5,3M6,5V9H9V5H6Z"/>
                </svg>
            </div>
            <h3>Font Inspector</h3>
        </div>
        <div class="font-info-grid"></div>
    `;
    return card;
}

function initializeFontInspector() {
    if (!fontInfoCard) {
        fontInfoCard = createFontInfoCard();
        document.body.appendChild(fontInfoCard);
    }
    
    // Show the card if it exists
    if (fontInfoCard) {
        fontInfoCard.style.display = 'block';
    }
    
    // Add event listeners
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
}

function cleanupFontInspector() {
    // Hide the card instead of removing it
    if (fontInfoCard) {
        fontInfoCard.classList.remove('visible');
        fontInfoCard.style.display = 'none';
    }

    if (currentHighlightedElement) {
        currentHighlightedElement.classList.remove('highlighted-text');
        currentHighlightedElement = null;
    }

    // Remove event listeners
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
}

// Listen for toggle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'toggleExtension') {
        isEnabled = request.isEnabled;
        if (isEnabled) {
            initializeFontInspector();
        } else {
            cleanupFontInspector();
        }
    }
});

function handleMouseOver(e) {
    if (!isEnabled) return;
    
    const target = e.target;
    if (target.nodeType === Node.ELEMENT_NODE && 
        !target.matches('.font-info-card, .font-info-card *')) {
        
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove('highlighted-text');
        }
        
        target.classList.add('highlighted-text');
        currentHighlightedElement = target;
        
        updateFontInfo(target);
        fontInfoCard.classList.add('visible');
    }
}

function handleMouseOut(e) {
    if (!isEnabled) return;
    
    const target = e.target;
    const relatedTarget = e.relatedTarget;

    // Check if we're moving to/from the font info card
    if (fontInfoCard && (
        target.matches('.font-info-card, .font-info-card *') ||
        (relatedTarget && relatedTarget.matches('.font-info-card, .font-info-card *'))
    )) {
        return;
    }

    if (!target.matches('.font-info-card, .font-info-card *')) {
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove('highlighted-text');
            currentHighlightedElement = null;
        }
        if (fontInfoCard) {
            fontInfoCard.classList.remove('visible');
        }
    }
}

// Initialize on page load
initializeState();

// Function to convert color values to hex
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const values = rgb.match(/\d+/g);
    if (!values) return rgb;
    return '#' + values.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

// Function to get computed font properties
function getFontProperties(element) {
    const computedStyle = window.getComputedStyle(element);
    return {
        fontFamily: computedStyle.fontFamily.split(',')[0].replace(/['"]/g, ''),
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        color: computedStyle.color
    };
}

// Function to update the font info card
function updateFontInfo(element) {
    const fontProps = getFontProperties(element);
    const hexColor = rgbToHex(fontProps.color);
    
    const infoGrid = fontInfoCard.querySelector('.font-info-grid');
    infoGrid.innerHTML = `
        <div class="font-info-item">
            <div class="info-label">Font</div>
            <div class="info-value">${fontProps.fontFamily}</div>
        </div>
        <div class="font-info-item">
            <div class="info-label">Size</div>
            <div class="info-value">${fontProps.fontSize}</div>
        </div>
        <div class="font-info-item">
            <div class="info-label">Weight</div>
            <div class="info-value">${fontProps.fontWeight}</div>
        </div>
        <div class="font-info-item">
            <div class="info-label">Color</div>
            <div class="info-value">
                <span class="color-preview" style="background-color: ${hexColor}"></span>
                ${hexColor}
            </div>
        </div>
    `;
    
    fontInfoCard.classList.add('visible');
}