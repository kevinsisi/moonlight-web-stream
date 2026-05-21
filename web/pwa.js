(function () {
    const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
    const canUseServiceWorker = "serviceWorker" in navigator && (window.location.protocol === "https:" || isLocalhost);

    function syncStandaloneClass() {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
        document.documentElement.classList.toggle("pwa-standalone", isStandalone);
    }

    function syncViewportHeight() {
        document.documentElement.style.setProperty("--pwa-viewport-height", `${window.innerHeight}px`);
    }

    syncStandaloneClass();
    syncViewportHeight();
    window.addEventListener("resize", syncViewportHeight, { passive: true });
    window.addEventListener("orientationchange", syncViewportHeight, { passive: true });

    if (!canUseServiceWorker) {
        return;
    }

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch((error) => {
            console.debug("Moonlight Web service worker registration failed", error);
        });
    });
})();
