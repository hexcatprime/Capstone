import init, { process_video } from '../pkg/freakstone.js';

document.getElementById('uploadVideoBtn').addEventListener('click', function() {
    const videoFile = document.getElementById('videoFile').files[0];
    if (videoFile) {
        uploadVideo(videoFile);
    } else {
        alert('Please select a video file to upload.');
    }
});

async function uploadVideo(file) {
    const formData = new FormData();
    formData.append('videoFile', file);

    try {
        const response = await fetch('/upload-video', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Video uploaded successfully:', data);

        fetch('/get-video')
        .then(response => response.arrayBuffer())
        .then(async (arrayBuffer) => {
            const bytes = new Uint8Array(arrayBuffer);

            // Call the WebAssembly function
            const result = process_video(bytes);
            alert(result);
        })
        .catch(error => console.error('Error fetching video file:', error));


    } catch (error) {
        console.error('Error uploading or processing video:', error);
    }
}
