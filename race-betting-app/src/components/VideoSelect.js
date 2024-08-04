// src/components/VideoSelect.js
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function VideoSelect({ onSelect }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'videos'));
        const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(videoList);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <h2>Select a Video</h2>
      <ul>
        {videos.map(video => (
          <li key={video.id} onClick={() => onSelect(video.videoId)}>
            {video.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VideoSelect;
