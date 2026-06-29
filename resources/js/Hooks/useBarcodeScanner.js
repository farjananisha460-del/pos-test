import { useEffect, useRef } from 'react';

/**
 * Custom React hook to capture rapid keyboard inputs from barcode scanners.
 * 
 * @param {Function} onScan - Callback when a complete barcode is scanned.
 * @param {number} threshold - Milliseconds allowed between keystrokes (default 40ms).
 */
export default function useBarcodeScanner(onScan, threshold = 40) {
    const buffer = useRef([]);
    const lastKeyTime = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore modifier keys
            if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
                return;
            }

            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;
            lastKeyTime.current = currentTime;

            // If the user presses Enter, evaluate the scanner buffer
            if (e.key === 'Enter') {
                if (buffer.current.length >= 4 && timeDiff < 100) {
                    const barcode = buffer.current.join('');
                    onScan(barcode);
                    e.preventDefault();
                }
                buffer.current = [];
                return;
            }

            // If time since last key is greater than threshold, clear the buffer and start new
            if (buffer.current.length > 0 && timeDiff > threshold) {
                buffer.current = [];
            }

            // Append key to buffer if it's a single character (alphanumeric/symbol)
            if (e.key.length === 1) {
                buffer.current.push(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onScan, threshold]);
}
