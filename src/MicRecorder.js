import React, {useState} from 'react';
import {ReactMic} from '@cleandersonlobo/react-mic';
import Icon from "@mdi/react";
import {mdiMicrophone, mdiStopCircleOutline} from "@mdi/js";
import {UploaderDialog} from "./UploaderDialog";
import defaultFetch from "./util";

export const MicRecorder = ({
  chatId,
  chatApiUrl
                            }) => {

  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  const startRecording = () => {
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    setUploading(true);
  };

  const onStop = (recordedBlob) => {
    console.log(recordedBlob);
    const formData = new FormData();
    formData.append('file', recordedBlob.blob);
    defaultFetch(`${chatApiUrl}/api/messages/${chatId}/upload`, 'POST', {}, formData).then(result => {
      setUploading(false);
    });
  };

  return (
    <div>
      {recording || uploading ?
        <div style={{display: 'flex'}}>
          <div>
            <ReactMic
              height={24}
              width={50}
              record={recording}
              onStop={onStop}
              strokeColor="#000000"
              backgroundColor="#fff"
              mimeType="audio/mp3"/>
          </div>
          <div>
            <Icon path={mdiStopCircleOutline} color='red' size={1} onClick={stopRecording}/>
          </div>
        </div>
        : <Icon path={mdiMicrophone} color='#aaa' size={1} onClick={startRecording}/>
      }
      <UploaderDialog open={uploading} setOpen={setUploading}/>
    </div>
  );
};
