let currentSize = 15;
let selectors = "";
let isMinimized = false; // Tracks if the overlay is hidden or shown
const domain = window.location.hostname;

// 1. Target the correct elements for the specific site
if (domain.includes("code.org")) {
    selectors = ".droplet-ace.ace_editor.ace-chrome";
} else if (domain.includes("cmu.edu")) {
    selectors = ".ace_editor.ace_hidpi.ace-xcode, .unit-container, .notes-page-inner, .console-output-text";
}else if (domain.includes("pltw.org") || domain.includes("thoughtindustries.com")) {
    selectors = ".page p, .page span, .page em, div.code-editor, div.codeOutput";
}

// 2. Apply or Remove the font size
function applyFontSize(size) {
    if (!selectors) return;
    
    // -- PART 1: The Global Style Sledgehammer --
    // This creates a global CSS rule that overrides stubborn inline styles from the website
    let styleTag = document.getElementById("code-sizer-stylesheet");
    
    if (size) {
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "code-sizer-stylesheet";
            document.head.appendChild(styleTag);
        }
        // This injects exactly what we need (e.g. "p, span { font-size: 25px !important; }")
        styleTag.innerHTML = `${selectors} { font-size: ${size}px !important; }`;
    } else {
        // If resetting to auto, delete our custom stylesheet entirely
        if (styleTag) styleTag.remove();
    }

    // -- PART 2: The Original Inline Method (kept for Code.org/CMU editor compatibility) --
    const elements = document.querySelectorAll(selectors);
    elements.forEach(el => {
        if (el && el.style) {
            if (size) {
                el.style.setProperty("font-size", size + "px", "important");
                if(el.className == "notes-page-inner"){
                    el.style.setProperty("max-width","100%","important");
                }
            } else {
                el.style.removeProperty("font-size");
                if(el.className == "notes-page-inner"){
                    el.style.removeProperty("max-width");
                }
            }
        }
    });
}

// 3. Create the Overlay UI (Only in the main window, not inside hidden iframes)
function createOverlay() {
    if (window !== window.top) return; 
    if (document.getElementById("code-sizer-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "code-sizer-overlay";
    
    Object.assign(overlay.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "999999",
        backgroundColor: "white",
        padding: isMinimized ? "8px" : "10px 15px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "sans-serif",
        color: "black",
        transition: "all 0.2s ease"
    });

    const contentDiv = document.createElement("div");
    Object.assign(contentDiv.style, {
        display: isMinimized ? "none" : "flex",
        alignItems: "center",
        gap: "10px"
    });

    const label = document.createElement("span");
    label.innerText = "Font Size:";
    Object.assign(label.style, {
        fontSize: "14px",
        fontWeight: "bold",
        whiteSpace: "nowrap"
    });

    const input = document.createElement("input");
    input.type = "number";
    input.min = "5";
    input.max = "999";
    input.value = currentSize;
    input.placeholder = "Auto"; // Shows when the box is empty
    Object.assign(input.style, {
        width: "60px",
        padding: "5px",
        fontSize: "16px",
        border: "1px solid #aaa",
        borderRadius: "4px"
    });

    // Listen for font changes
    input.addEventListener("input", function() {
        currentSize = this.value;
        applyFontSize(currentSize);
        chrome.storage.local.set({ "savedSize": currentSize });
    });

    // Reset Button
    const resetBtn = document.createElement("button");
    resetBtn.innerText = "↺";
    resetBtn.title = "Reset to default size";
    Object.assign(resetBtn.style, {
        background: "#f0f0f0",
        border: "1px solid #aaa",
        cursor: "pointer",
        fontSize: "16px",
        padding: "4px 8px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    });
    
    resetBtn.addEventListener("click", () => {
        currentSize = ""; // Clear the size
        input.value = ""; // Clear the input box
        applyFontSize(currentSize); // Remove styles from the page
        chrome.storage.local.set({ "savedSize": currentSize }); // Save the empty state
    });

    contentDiv.appendChild(label);
    contentDiv.appendChild(input);
    contentDiv.appendChild(resetBtn);

    // Minimize / Expand Button
    const toggleBtn = document.createElement("button");
    toggleBtn.innerText = isMinimized ? "Aa" : "➖";
    toggleBtn.title = isMinimized ? "Expand Controls" : "Minimize Controls";
    Object.assign(toggleBtn.style, {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        padding: "4px 8px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    });

    toggleBtn.onmouseover = () => toggleBtn.style.backgroundColor = "#e0e0e0";
    toggleBtn.onmouseout = () => toggleBtn.style.backgroundColor = "transparent";

    toggleBtn.addEventListener("click", () => {
        isMinimized = !isMinimized;
        if (isMinimized) {
            contentDiv.style.display = "none";
            toggleBtn.innerText = "Aa";
            toggleBtn.title = "Expand Controls";
            overlay.style.padding = "8px";
        } else {
            contentDiv.style.display = "flex";
            toggleBtn.innerText = "➖";
            toggleBtn.title = "Minimize Controls";
            overlay.style.padding = "10px 15px";
        }
    });

    overlay.appendChild(contentDiv);
    overlay.appendChild(toggleBtn);
    document.body.appendChild(overlay);
}

// 4. Main Initialization
if (selectors) {
    chrome.storage.local.get(["savedSize"], function(items) {
        if (typeof items.savedSize !== "undefined") {
            currentSize = items.savedSize;
        }
        
        applyFontSize(currentSize);
        createOverlay();
        
        let timeout;
        const observer = new MutationObserver((mutations) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                applyFontSize(currentSize);
                createOverlay(); 
            }, 100);
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
}

// 5. Listen for changes across iframes (Keeps the main page and PLTW lesson frames in sync)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && typeof changes.savedSize !== 'undefined') {
        currentSize = changes.savedSize.newValue;
        applyFontSize(currentSize);
    }
});