// src/components/VideoPlayer.js
import React from 'react';

function VideoPlayer({ videoId }) {
  const videoUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div>
      <iframe
        width="560"
        height="315"
        src={videoUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default VideoPlayer;
