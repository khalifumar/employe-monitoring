
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    /**
     * PRIVACY INVARIANT (Zero-Content Logging):
     * Strictly counts DOM interaction events.
     * NEVER reads, accesses, or stores:
     * - event.key or typed characters
     * - Form input values or passwords
     * - Page URLs or domain names
     * - Document titles or page content
     */
    let localEventCounter = 0;
    let lastMoveTime = 0;
    let lastScrollTime = 0;

    // 1. Keydown Counter (Count only, no event.key inspection)
    window.addEventListener(
      'keydown',
      () => {
        localEventCounter++;
      },
      { passive: true, capture: true }
    );

    // 2. Click Counter
    window.addEventListener(
      'click',
      () => {
        localEventCounter++;
      },
      { passive: true, capture: true }
    );

    // 3. Scroll Counter (Throttled to avoid overwhelming)
    window.addEventListener(
      'scroll',
      () => {
        const now = Date.now();
        if (now - lastScrollTime > 500) {
          localEventCounter++;
          lastScrollTime = now;
        }
      },
      { passive: true, capture: true }
    );

    // 4. Mouse Move Activity (Throttled)
    window.addEventListener(
      'mousemove',
      () => {
        const now = Date.now();
        if (now - lastMoveTime > 1000) {
          localEventCounter++;
          lastMoveTime = now;
        }
      },
      { passive: true, capture: true }
    );

    // Flush counts to background service worker periodically
    setInterval(() => {
      if (localEventCounter > 0) {
        const countToFlush = localEventCounter;
        localEventCounter = 0;

        try {
          if (chrome.runtime && chrome.runtime.id) {
            chrome.runtime.sendMessage({
              type: 'INPUT_COUNTS_REPORT',
              count: countToFlush,
            });
          }
        } catch {
          // Extension context might be invalidated on reload
        }
      }
    }, 15_000); // Flush every 15s into the 1-minute aggregator bucket

    // Also respond directly to pull requests from background
    chrome.runtime.onMessage?.addListener((msg, _sender, sendResponse) => {
      if (msg.type === 'GET_INPUT_COUNTS') {
        const count = localEventCounter;
        localEventCounter = 0;
        sendResponse({ count });
      }
      return false;
    });
  },
});
