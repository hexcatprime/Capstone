import init, { process_video } from '../pkg/freakstone.js'

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

        // Check if response is JSON
        if (response.headers.get('Content-Type')?.includes('application/json')) {
            const data = await response.json();
            const filename = data.filename;

            console.log('Video uploaded successfully with filename:', filename);

            // Fetch the video using the new filename
            fetch(`/get-video/${filename}`)
                .then(response => response.arrayBuffer())
                .then(async (arrayBuffer) => {
                    const bytes = new Uint8Array(arrayBuffer);

                    // Call the WebAssembly function
                    const result = process_video(bytes);
                    console.log(result);
                })
                .catch(error => console.error('Error fetching video file:', error));

        } else {
            const text = await response.text();
            console.error('Unexpected response format:', text);
        }

    } catch (error) {
        console.error('Error uploading or processing video:', error);
    }
}
