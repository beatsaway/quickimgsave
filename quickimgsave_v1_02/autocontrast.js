/**
 * Image enhancement utility that provides contrast and brightness adjustments
 */

class AutoContrast {
    constructor() {
        this.brightness = 20;
        this.contrast = 2.0;
    }

    /**
     * Applies contrast and brightness enhancements to an image
     * @param {HTMLImageElement} image - The image to enhance
     * @returns {HTMLCanvasElement} - Canvas with enhanced image
     */
    applyEnhancements(image) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        
        offCanvas.width = image.width;
        offCanvas.height = image.height;
        offCtx.drawImage(image, 0, 0);

        const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            data[i] += this.brightness;
            data[i + 1] += this.brightness;
            data[i + 2] += this.brightness;

            // Apply contrast
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * this.contrast + 128));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * this.contrast + 128));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * this.contrast + 128));
        }

        offCtx.putImageData(imageData, 0, 0);
        return offCanvas;
    }

    /**
     * Sets the brightness value
     * @param {number} value - Brightness value (-255 to 255)
     */
    setBrightness(value) {
        this.brightness = Math.max(-255, Math.min(255, value));
    }

    /**
     * Sets the contrast value
     * @param {number} value - Contrast value (0 to 10)
     */
    setContrast(value) {
        this.contrast = Math.max(0, Math.min(10, value));
    }

    /**
     * Gets the current brightness value
     * @returns {number} - Current brightness value
     */
    getBrightness() {
        return this.brightness;
    }

    /**
     * Gets the current contrast value
     * @returns {number} - Current contrast value
     */
    getContrast() {
        return this.contrast;
    }
}

// Export the class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoContrast;
} else {
    window.AutoContrast = AutoContrast;
} 