import React, { useState } from 'react';
import { Backdrop, CircularProgress, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  backdrop: {
    zIndex: 999,
    color: '#fff',
  },
  imageMessage: {
    maxHeight: '80vh',
    maxWidth: '80vw',
  },
}));

export const ImageLoader = ({ classes, url }) => {
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const styles = useStyles();

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
        onClick={() => setImageOpen(true)}
      />
      <Backdrop
        className={styles.backdrop}
        open={imageOpen}
        onClick={() => setImageOpen(false)}
      >
        <img
          src={url}
          alt={url}
          onLoad={onLoad}
          onError={onError}
          className={styles.imageMessage}
        />
      </Backdrop>
    </div>
  );
};
export default ImageLoader;
