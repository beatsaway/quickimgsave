/**
 * Image rotation utility that provides rotation functionality for images
 */
class ImageRotator {
    constructor() {
        this.imageRotations = new Map();
        this.originalImageData = new Map();
        this.rotatedCanvases = new Map(); // Cache rotated canvases
    }

    /**
     * Rotates all images in the specified direction
     * @param {string} direction - 'clockwise' or 'counterclockwise'
     * @param {Function} onRotationComplete - Callback after rotation is complete
     */
    rotateAllImages(direction, onRotationComplete) {
        const containers = document.querySelectorAll('.image-container');
        containers.forEach(container => {
            this.rotateImage(container, direction, onRotationComplete);
        });
    }

    /**
     * Rotates a single image
     * @param {HTMLElement} containerDiv - Container element of the image
     * @param {string} direction - 'clockwise' or 'counterclockwise'
     * @param {Function} onRotationComplete - Callback after rotation is complete
     */
    rotateImage(containerDiv, direction, onRotationComplete) {
        const img = containerDiv.querySelector('img');
        const fileName = img.dataset.fileName;
        let currentRotation = this.imageRotations.get(fileName) || 0;
        
        currentRotation += direction === 'clockwise' ? 90 : -90;
        currentRotation = ((currentRotation % 360) + 360) % 360; // Normalize to 0-359
        this.imageRotations.set(fileName, currentRotation);
        
        // Remove CSS transform - we'll handle rotation through canvas
        img.style.transform = '';

        if (onRotationComplete) {
            onRotationComplete(img, fileName, currentRotation);
        }
    }

    /**
     * Updates an image with rotation applied
     * @param {HTMLImageElement} img - The image element
     * @param {string} fileName - Name of the image file
     * @param {number} rotation - Rotation angle in degrees
     * @returns {HTMLCanvasElement} - Canvas with rotated image
     */
    updateImageWithRotation(img, fileName, rotation) {
        // Normalize rotation to 0-359
        rotation = ((rotation % 360) + 360) % 360;
        
        // Check if we have a cached canvas for this rotation
        const cacheKey = `${fileName}_${rotation}`;
        if (this.rotatedCanvases.has(cacheKey)) {
            return this.rotatedCanvases.get(cacheKey);
        }

        const originalImage = this.originalImageData.get(fileName);
        if (!originalImage) {
            console.error('Original image not found for:', fileName);
            return document.createElement('canvas');
        }

        // Only create new canvas for actual rotations (not 0 or 360)
        if (rotation === 0) {
            const canvas = document.createElement('canvas');
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            canvas.getContext('2d').drawImage(originalImage, 0, 0);
            return canvas;
        }

        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        
        const useSwappedDimensions = Math.abs(rotation % 180) === 90;
        const w = useSwappedDimensions ? originalImage.height : originalImage.width;
        const h = useSwappedDimensions ? originalImage.width : originalImage.height;
        
        offCanvas.width = w;
        offCanvas.height = h;
        
        offCtx.save();
        offCtx.translate(offCanvas.width/2, offCanvas.height/2);
        offCtx.rotate(rotation * Math.PI/180);
        offCtx.drawImage(originalImage, -originalImage.width/2, -originalImage.height/2);
        offCtx.restore();

        // Cache the rotated canvas
        this.rotatedCanvases.set(cacheKey, offCanvas);
        
        return offCanvas;
    }

    /**
     * Stores original image data for later use
     * @param {HTMLImageElement} image - The original image
     * @param {string} fileName - Name of the image file
     */
    storeOriginalImage(image, fileName) {
        this.originalImageData.set(fileName, image);
        this.imageRotations.set(fileName, 0);
        // Clear any cached rotations for this image
        for (const key of this.rotatedCanvases.keys()) {
            if (key.startsWith(fileName)) {
                this.rotatedCanvases.delete(key);
            }
        }
    }

    /**
     * Gets the current rotation for an image
     * @param {string} fileName - Name of the image file
     * @returns {number} - Current rotation angle in degrees
     */
    getRotation(fileName) {
        return this.imageRotations.get(fileName) || 0;
    }

    /**
     * Creates rotation controls for an image
     * @param {HTMLElement} containerDiv - Container to add controls to
     * @param {Function} onRotate - Callback when rotation occurs
     * @returns {HTMLElement} - Created controls container
     */
    createRotationControls(containerDiv, onRotate) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'rotation-controls';
        
        const rotateLeftBtn = document.createElement('button');
        rotateLeftBtn.textContent = '↺';
        rotateLeftBtn.className = 'rotate-btn';
        rotateLeftBtn.onclick = () => {
            this.rotateImage(containerDiv, 'counterclockwise', onRotate);
        };
        
        const rotateRightBtn = document.createElement('button');
        rotateRightBtn.textContent = '↻';
        rotateRightBtn.className = 'rotate-btn';
        rotateRightBtn.onclick = () => {
            this.rotateImage(containerDiv, 'clockwise', onRotate);
        };
        
        controlsDiv.appendChild(rotateLeftBtn);
        controlsDiv.appendChild(rotateRightBtn);
        
        return controlsDiv;
    }
}

// Export the class for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageRotator;
} else {
    window.ImageRotator = ImageRotator;
} 