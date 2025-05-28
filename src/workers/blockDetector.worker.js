let lastHeartbeat = Date.now();

self.onmessage = function(e) {
    if (e.data.type === 'HEARTBEAT') {
        const now = Date.now();
        const delta = now - lastHeartbeat;

        if (delta > 500) {
            self.postMessage({ type: 'UI_BLOCKED' });
        } else {
            self.postMessage({ type: 'UI_RECOVERED' });
        }

        lastHeartbeat = now;
    }
};
