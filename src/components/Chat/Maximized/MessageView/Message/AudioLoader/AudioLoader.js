import React from 'react';

export const AudioLoader = ({ media, classes }) => (
  <audio controls className={classes.audio}>
    <source src={media.url} />
    {/* TODO: ADD A REAL TRACK OBJECT */}
    <track default kind="captions" src={media.url} />
  </audio>
);
export default AudioLoader;
