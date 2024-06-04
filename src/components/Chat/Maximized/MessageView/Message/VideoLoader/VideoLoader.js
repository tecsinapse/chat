import React from 'react';

export const VideoLoader = ({ media, classes }) => (
  <video width={200} className={classes.thumbnail} controlsList='nodownload noplaybackrate' disablePictureInPicture controls>
    <source src={media.url} />
    {/* TODO: ADD A REAL TRACK OBJECT */}
    <track default kind="captions" src={media.url} />
  </video>
);
export default VideoLoader;
