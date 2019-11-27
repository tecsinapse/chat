import React, { useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export const ImageLoader = ({ classes, url }) => {
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const onLoad = e => {
    e.stopPropagation();
    setLoading(false);
  };

  const onError = e => {
    e.stopPropagation();
    if (loading) {
      setLoading(false);
    }
    if (!imageError) {
      setImageError(true);
    }
  };

  return (
    <div
      className={
        loading || imageError ? classes.emptyBubble : classes.thumbnail
      }
    >
      {loading && !imageError && (
        <CircularProgress className={classes.progress} />
      )}

      <img
        src={url}
        alt={url}
        onLoad={onLoad}
        onError={onError}
        className={classes.imageMessage}
      />
    </div>
  );
};
export default ImageLoader;
