import React, { forwardRef } from 'react';
import uniqid from 'uniqid';

import { Uploader } from '@tecsinapse/uploader';

export const onAccept = ({ setFiles, files, focusRef }) => newFiles => {
  if (focusRef) {
    focusRef.focus();
  }

  const copyFiles = { ...files };

  newFiles.forEach(file => {
    const reader = new FileReader();
    const uid = uniqid();

    // convert all no image, no video and no application to application unknown mime type
    const type = (file && file.type) || {};
    const mediaTypeFile =
      type.startsWith('image') ||
      type.startsWith('video') ||
      type.startsWith('application')
        ? file.type
        : 'application/octet-stream';

    // Create preview tag
    reader.onload = event => {
      copyFiles[uid] = {
        file,
        mediaType: mediaTypeFile,
        data: event.target.result,
        name: file.name,
        size: Math.round(file.size / 1024),
      };

      setFiles(copyFiles);
    };
    reader.readAsDataURL(file);
  });
};

export const CustomUploader = forwardRef(
  (
    { files, setFiles, mediaType, focusRef, maxFileUploadSize, uploadOptions },
    ref
  ) => {
    const { maxFilesPerMessage, ...messages } = uploadOptions;

    return (
      <>
        <Uploader
          value={files}
          onAccept={onAccept({ setFiles, files, focusRef })}
          filesLimit={maxFilesPerMessage}
          silent
          messages={messages}
          ref={ref}
          acceptedFormat={mediaType ? [mediaType] : undefined}
          maxFileSize={maxFileUploadSize}
        />
      </>
    );
  }
);
