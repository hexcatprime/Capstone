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
        const uploadResponse = await fetch('/upload-video', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error('Upload failed');
        }

        const uploadData = await uploadResponse.json();
        const filename = uploadData.filename; // Ensure your server returns this

        const videoResponse = await fetch(`/get-video/${filename}`);
        if (!videoResponse.ok) {
            throw new Error('Failed to fetch video');
        }

        const arrayBuffer = await videoResponse.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Call the WebAssembly function
        const result = process_video(bytes);
        alert(result);

        // Delete the video file after processing
        const deleteResponse = await fetch(`/delete-video/${filename}`, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete video');
        }

    } catch (error) {
        console.error('Error uploading or processing video:', error);
    }
}