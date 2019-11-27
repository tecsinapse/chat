import React from 'react';

export const VideoLoader = ({ media, classes }) => (
  <video controls width={200} className={classes.thumbnail}>
    <source src={media.url} />
    {/* TODO: ADD A REAL TRACK OBJECT */}
    <track default kind="captions" src={media.url} />
  </video>
);
export default VideoLoader;
