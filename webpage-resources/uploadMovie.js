import init, { fetch_movie } from '../pkg/freakstone.js';
import { run } from './loadCsv.js';

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
        const { filename, title, year } = uploadData;

        console.log('Video year:', year);
        console.log('Video title:', title);

        await init();
        
        const result = await fetch_movie(title, year);
        const resultString = result.toString()

        // Split the result into an array
        const arr = resultString.split(',');


        const deleteResponse = await fetch(`/delete-video/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete video');
        }

        try {
            const response = await fetch('/append-csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ row: arr })
            });

            if (response.ok) {
                alert('New movie added successfully.');
                await run();
            } else {
                alert('Failed to add new movie.');
            }
        } catch (error) {
            console.error('Error adding new movie:', error);
            alert('Error adding new movie.');
        }

    } catch (error) {
        console.error('Error uploading or processing video:', error);
    }
}
