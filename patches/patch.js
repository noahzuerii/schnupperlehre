// small patch that is supposed to clear the browser state,
// if the changes have been done more than 12h ago.
// Rational: we don't want student's to see other's solutions
// that are still cached.
// Author: Gemini (sry, I suck at JavaScript)

(async function() {
    const DB_NAME = 'JupyterLite Storage';
    const EXPIRY_TIME = 12 * 60 * 60 * 1000; // 12 Hours
    const now = Date.now();
    
    let lastReset = localStorage.getItem('last_jupyter_reset');

    // 1. If no timestamp exists, this is a fresh start. Set it and exit.
    if (!lastReset) {
        localStorage.setItem('last_jupyter_reset', now.toString());
        return;
    }

    // 2. Check if the current time is past the original 12h window
    if (now - parseInt(lastReset) > EXPIRY_TIME) {
        console.log("New day, new student. Clearing storage...");

        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

        deleteRequest.onsuccess = () => {
            localStorage.removeItem('last_jupyter_reset');
            localStorage.clear(); 
            window.location.reload();
        };

        deleteRequest.onblocked = () => {
            alert("Cleaning up previous session. Please close other tabs to continue.");
        };
        
        return; 
    }
})();


// Script that hides elements in jupyter notebook to prevent user from breaking stuff
// This script is "injected" into ./dist/lab/index.html (see pipeline)
// Author: Chat-GPT & Antigravity
function initHiding() {
    // Use a mutation observer to ensure the elements are hidden even if the DOM changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                hideSpecificElements();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Function to hide specific elements
    function hideSpecificElements() {
        const selectors = [
            // file browser search menu
            '.jp-FileBrowser-toolbar.jp-SidePanel-toolbar.jp-Toolbar.lm-Widget',
            // jupyter lite icon / logo (typestyle class hash, plus fallback standard template class names)
            '.f1xpzunt.lm-Widget',
            '.jp-MainTemplate-logo',
            '#jp-MainLogo',
            // "click to add new cell"
            '.jp-Notebook-footer.lm-Widget',
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
            });
        });
    }

    // Initially hide specific elements
    hideSpecificElements();
}

// Ensure initHiding runs whether DOMContentLoaded has already fired or not
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHiding);
} else {
    initHiding();
}

// Friendly welcome overlay, shown once per browser tab (see style.css for
// the actual look). Doubles as a nicer thing to look at while the Pyodide
// kernel boots up in the background.
function showWelcomeOverlay() {
    if (sessionStorage.getItem('schnuppertag_intro_seen')) {
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'schnuppertag-welcome';
    overlay.innerHTML = `
        <div class="schnuppertag-welcome-card">
            <div class="schnuppertag-welcome-badge">Schnuppertag</div>
            <h1>Willkommen in deinem Python-Lab</h1>
            <p>Links siehst du die Aufgaben. Öffne eine Datei, lies die Beschreibung und schreib deinen Code in das leere Feld darunter.</p>
            <button type="button">Los geht's</button>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('button').addEventListener('click', () => {
        sessionStorage.setItem('schnuppertag_intro_seen', '1');
        overlay.classList.add('schnuppertag-welcome-hide');
        setTimeout(() => overlay.remove(), 400);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showWelcomeOverlay);
} else {
    showWelcomeOverlay();
}

// Custom favicon so the browser tab doesn't show the stock JupyterLite icon.
function setFavicon() {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>"
        + "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>"
        + "<stop offset='0%' stop-color='%23ff5d8f'/>"
        + "<stop offset='100%' stop-color='%232dd4bf'/>"
        + "</linearGradient></defs>"
        + "<circle cx='32' cy='32' r='30' fill='url(%23g)'/>"
        + "<text x='32' y='43' font-size='30' font-family='Menlo, monospace' font-weight='700' "
        + "text-anchor='middle' fill='%2314111f'>S</text></svg>";

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = 'data:image/svg+xml,' + svg;
}
setFavicon();