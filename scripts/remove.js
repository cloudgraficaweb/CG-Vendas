let isRemoveColorClickMode = false;
let sensitivityValueClick = 75;
let isRemoveColorTotalMode = false;
let sensitivityValueTotal = 75;

document.getElementById('removeColor').addEventListener('click', openRemoveColorBox);
document.getElementById('applyRemoveColor').addEventListener('click', applyRemoveColor);
document.getElementById('cancelRemoveColor').addEventListener('click', closeRemoveColorBox);

document.getElementById('colorSensitivitySlider').addEventListener('input', updateColorSensitivity);

function openRemoveColorBox() {
    const removeColorBox = document.getElementById('removeColorFloatingBox');
    removeColorBox.style.display = 'block';

    const removeColorCanvas = document.getElementById('removeColorCanvas');
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
        alert('Por favor, selecione uma imagem primeiro!');
        closeRemoveColorBox();
        return;
    }

    prepareCanvasForColorRemoval(activeObject);
}

function closeRemoveColorBox() {
    document.getElementById('removeColorFloatingBox').style.display = 'none';
}

function updateColorSensitivity() {
    sensitivityValueClick = parseInt(document.getElementById('colorSensitivitySlider').value);
    document.getElementById('colorSensitivityValue').textContent = sensitivityValueClick;
}

function prepareCanvasForColorRemoval(imageObject) {
    const removeColorCanvas = document.getElementById('removeColorCanvas');
    const removeColorCtx = removeColorCanvas.getContext('2d');

    removeColorCanvas.width = imageObject.width * imageObject.scaleX;
    removeColorCanvas.height = imageObject.height * imageObject.scaleY;
    removeColorCtx.clearRect(0, 0, removeColorCanvas.width, removeColorCanvas.height);

    const img = new Image();
    img.src = imageObject.getSrc();
    img.onload = function() {
        removeColorCtx.drawImage(img, 0, 0, removeColorCanvas.width, removeColorCanvas.height);
    };

    removeColorCanvas.addEventListener('click', function(e) {
        const rect = removeColorCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const imageData = removeColorCtx.getImageData(0, 0, removeColorCanvas.width, removeColorCanvas.height);
        const targetColor = getPixelColor(imageData, x, y);

        floodFillRemove(imageData, x, y, sensitivityValueClick, targetColor);

        removeColorCtx.putImageData(imageData, 0, 0);
    });
}

function applyRemoveColor() {
    const removeColorCanvas = document.getElementById('removeColorCanvas');
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
        fabric.Image.fromURL(removeColorCanvas.toDataURL(), function(img) {
            canvas.remove(activeObject);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    }
    closeRemoveColorBox();
}

function floodFillRemove(imageData, x, y, sensitivity, targetColor) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const stack = [[x, y]];
    const processed = new Set();

    function colorMatch(color1, color2) {
        return Math.abs(color1.r - color2.r) <= sensitivity &&
               Math.abs(color1.g - color2.g) <= sensitivity &&
               Math.abs(color1.b - color2.b) <= sensitivity;
    }

    while (stack.length) {
        const [curX, curY] = stack.pop();
        const key = `${curX},${curY}`;
        if (processed.has(key)) continue;
        processed.add(key);
        const index = (curY * width + curX) * 4;
        const currentColor = {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3]
        };
        if (colorMatch(currentColor, targetColor) && currentColor.a !== 0) {
            data[index + 3] = 0; // Convert to transparent
            if (curX > 0) stack.push([curX - 1, curY]);
            if (curX < width - 1) stack.push([curX + 1, curY]);
            if (curY > 0) stack.push([curX, curY - 1]);
            if (curY < height - 1) stack.push([curX, curY + 1]);
        }
    }
}

function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

document.getElementById('removeColorTotal').addEventListener('click', openRemoveColorTotalBox);
document.getElementById('applyRemoveColorTotal').addEventListener('click', applyRemoveColorTotal);
document.getElementById('cancelRemoveColorTotal').addEventListener('click', closeRemoveColorTotalBox);

document.getElementById('colorSensitivitySliderTotal').addEventListener('input', updateSensitivityTotal);

function openRemoveColorTotalBox() {
    const removeColorTotalBox = document.getElementById('removeColorTotalFloatingBox');
    removeColorTotalBox.style.display = 'block';

    const removeColorTotalCanvas = document.getElementById('removeColorTotalCanvas');
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
        alert('Por favor, selecione uma imagem primeiro!');
        closeRemoveColorTotalBox();
        return;
    }

    prepareCanvasForColorTotalRemoval(activeObject);
}

function closeRemoveColorTotalBox() {
    document.getElementById('removeColorTotalFloatingBox').style.display = 'none';
}

function updateSensitivityTotal() {
    sensitivityValueTotal = parseInt(document.getElementById('colorSensitivitySliderTotal').value);
    document.getElementById('colorSensitivityValueTotal').textContent = sensitivityValueTotal;
}

function prepareCanvasForColorTotalRemoval(imageObject) {
    const removeColorTotalCanvas = document.getElementById('removeColorTotalCanvas');
    const removeColorTotalCtx = removeColorTotalCanvas.getContext('2d');

    removeColorTotalCanvas.width = imageObject.width * imageObject.scaleX;
    removeColorTotalCanvas.height = imageObject.height * imageObject.scaleY;
    removeColorTotalCtx.clearRect(0, 0, removeColorTotalCanvas.width, removeColorTotalCanvas.height);

    const img = new Image();
    img.src = imageObject.getSrc();
    img.onload = function() {
        removeColorTotalCtx.drawImage(img, 0, 0, removeColorTotalCanvas.width, removeColorTotalCanvas.height);
    };

    removeColorTotalCanvas.addEventListener('click', function(e) {
        const rect = removeColorTotalCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const imageData = removeColorTotalCtx.getImageData(0, 0, removeColorTotalCanvas.width, removeColorTotalCanvas.height);
        const targetColor = getPixelColor(imageData, x, y);

        removeColorTotal(imageData, targetColor);

        removeColorTotalCtx.putImageData(imageData, 0, 0);
    });
}

function applyRemoveColorTotal() {
    const removeColorTotalCanvas = document.getElementById('removeColorTotalCanvas');
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
        fabric.Image.fromURL(removeColorTotalCanvas.toDataURL(), function(img) {
            canvas.remove(activeObject);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    }
    closeRemoveColorTotalBox();
}

function removeColorTotal(imageData, targetColor) {
    const transparentColor = {r: 0, g: 0, b: 0, a: 0};

    for (let i = 0; i < imageData.data.length; i += 4) {
        const currentColor = {
            r: imageData.data[i],
            g: imageData.data[i + 1],
            b: imageData.data[i + 2],
            a: imageData.data[i + 3]
        };

        if (colorMatch(currentColor, targetColor)) {
            setPixelColor(imageData, i, transparentColor);
        }
    }
}

function setPixelColor(imageData, index, color) {
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = color.a;
}

function colorMatch(color1, color2) {
    const threshold = sensitivityValueTotal;
    return Math.abs(color1.r - color2.r) <= threshold &&
           Math.abs(color1.g - color2.g) <= threshold &&
           Math.abs(color1.b - color2.b) <= threshold;
}