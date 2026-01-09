// script.js

const screens = {
    start: document.querySelector('.start-screen'),
    camera: document.getElementById('cameraScreen'),
    printing: document.getElementById('printingScreen'),
    final: document.getElementById('finalScreen')
};

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countdown = document.getElementById('countdown');

let photos = [];
let stream = null;
let recipientName = '';

// Start button
document.getElementById('startBtn').addEventListener('click', () => {
    // recipientName = document.getElementById('nameInput').value.trim() || 'Ani';
    recipientName = document.getElementById('nameInput').value.trim() || 'Christmas Party';
    showScreen('camera');
    startCamera();
});

// Show screen
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Start camera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' },
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        alert('Camera access denied. Using demo mode.');
    }
}

// Capture photo
document.getElementById('captureBtn').addEventListener('click', () => {
    startCountdown();
});

function startCountdown() {
    let count = 3;
    countdown.textContent = count;
    countdown.style.display = 'block';
    document.getElementById('captureBtn').disabled = true;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count;
        } else {
            clearInterval(interval);
            countdown.style.display = 'none';
            capturePhoto();
            document.getElementById('captureBtn').disabled = false;
        }
    }, 1000);
}

function capturePhoto() {
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg');
    photos.push(photoData);

    document.getElementById('photoCount').textContent = photos.length;

    if (photos.length >= 4) {
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'inline-block';
    }

    document.getElementById('retakeBtn').style.display = 'inline-block';
}

// Retake
document.getElementById('retakeBtn').addEventListener('click', () => {
    if (photos.length > 0) {
        photos.pop();
        document.getElementById('photoCount').textContent = photos.length;
        
        if (photos.length < 4) {
            document.getElementById('captureBtn').style.display = 'inline-block';
            document.getElementById('nextBtn').style.display = 'none';
        }
        
        if (photos.length === 0) {
            document.getElementById('retakeBtn').style.display = 'none';
        }
    }
});

// Next to printing
document.getElementById('nextBtn').addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    showPrinting();
});

function showPrinting() {
    showScreen('printing');
    document.getElementById('names1').textContent = `Ani & ${recipientName}`;
    
    const photoSlots = document.querySelectorAll('#photoStrip .photo-slot');
    photoSlots.forEach((slot, index) => {
        if (photos[index]) {
            setTimeout(() => {
                slot.innerHTML = `<img src="${photos[index]}" alt="Photo ${index + 1}">`;
                slot.classList.remove('placeholder');
            }, (index + 1) * 1000);
        }
    });

    setTimeout(() => {
        showFinal();
    }, 3000);
}

function showFinal() {
    showScreen('final');
    document.getElementById('names2').textContent = `Ani & ${recipientName}`;
    
    const finalStrip = document.getElementById('finalPhotoStrip');
    finalStrip.innerHTML = '';
    photos.forEach(photo => {
        const slot = document.createElement('div');
        slot.className = 'photo-slot';
        slot.innerHTML = `<img src="${photo}" alt="Photo">`;
        finalStrip.appendChild(slot);
    });
}

// Download
document.getElementById('downloadBtn').addEventListener('click', () => {
    const printCanvas = document.createElement('canvas');
    const printCtx = printCanvas.getContext('2d');
    printCanvas.width = 400;
    printCanvas.height = 1500;

    // Background
    printCtx.fillStyle = '#f0f0f0';
    printCtx.fillRect(0, 0, printCanvas.width, printCanvas.height);

    // Draw photos
    const photoHeight = 350;
    photos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
            printCtx.drawImage(img, 25, 25 + (index * photoHeight), 350, photoHeight);
            
            // Add text after last image loads
            if (index === photos.length - 1) {
                printCtx.fillStyle = '#333';
                printCtx.font = 'italic 24px Georgia';
                printCtx.textAlign = 'center';
                printCtx.fillText(`Ani & ${recipientName}`, 200, 1460);
                printCtx.fillText("Captured Smiles", 200, 1490);
                
                // Download
                const link = document.createElement('a');
                link.download = 'photobooth.jpg';
                link.href = printCanvas.toDataURL('image/jpeg');
                link.click();
            }
        };
    });
});

// Restart
document.getElementById('restartBtn').addEventListener('click', () => {
    photos = [];
    recipientName = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('photoCount').textContent = '0';
    document.getElementById('captureBtn').style.display = 'inline-block';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    showScreen('start');
});