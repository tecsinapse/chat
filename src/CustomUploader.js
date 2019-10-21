import React, {forwardRef, useState} from 'react';
import uniqid from 'uniqid';
import {Uploader} from '@tecsinapse/ui-kit/build/UploadFile/Uploader';
import defaultFetch from "./util";
import {UploaderDialog} from './Chat/UploaderDialog'

export const CustomUploader = forwardRef(
  ({type, variant, silent = false, chatApiUrl, chatId}, ref) => {
    const [files, setFiles] = useState({});
    const [open, setOpen] = useState(false);

    const onAccept = newFiles => {
      setOpen(true);
      const copyFiles = {...files};
      newFiles.forEach(file => {
        const reader = new FileReader();
        const uid = uniqid();

        // Set state after reading async the files
        reader.onload = event => {

          const formData = new FormData();
          formData.append('file', file);
          defaultFetch(`${chatApiUrl}/api/messages/${chatId}/upload`, 'POST', {}, formData).then(result => {
            copyFiles[uid] = {
              file,
              data: event.target.result,
              completed: 0,
              uploader: null,
              error: null,
            };
            setFiles(copyFiles);
            setOpen(false);
          });
        };
        reader.readAsDataURL(file);
      });
    };

    const onReject = newFiles => {
    };

    const messages = {
      maximumFileLimitMessage: limit => `Apenas ${limit} arquivo(s) podem ser enviados por vez`
    };

    return (
      <React.Fragment>
        <Uploader
          value={files}
          onAccept={onAccept}
          onReject={onReject}
          filesLimit={1}
          silent={silent}
          ref={ref}
          messages={messages}
        />
        <UploaderDialog open={open} setOpen={setOpen}/>
      </React.Fragment>
    );
  }
);
