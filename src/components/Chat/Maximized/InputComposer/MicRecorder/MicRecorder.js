import React, { useEffect, useRef, useState } from 'react';
import { ReactMic } from '@tecsinapse/react-mic';
import Icon from '@mdi/react';
import {
  mdiCheckboxBlankCircle,
  mdiCheckCircle,
  mdiCloseCircle,
} from '@mdi/js';
import PropTypes from 'prop-types';
import { IconButton } from '@livechat/ui-kit';
import Timer from 'react-compound-timer';
import { makeStyles, Typography } from '@material-ui/core';
import {
  defaultBlack,
  defaultGrey2,
  defaultWhite,
} from '@tecsinapse/ui-kit/build/utils/colors';

const useStyle = makeStyles({
  reactMic: {
    opacity: '0.30',
  },
  recordingText: {
    color: defaultGrey2,
    fontSize: '12px',
    lineHeight: 1,
  },
  recordingTime: {
    color: defaultGrey2,
    fontSize: '18px',
    lineHeight: 1,
    fontWeight: 900,
  },
});

export const MicRecorder = ({
  onStopRecording,
  iconSize,
  flexGrow,
  waveWidth,
  waveHeight,
  onSendReactGAEvent,
}) => {
  const [recording, setRecording] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const accepted = useRef(false);

  const classes = useStyle();

  const stopRecording = acceptedClicked => {
    if (!acceptedClicked) {
      onSendReactGAEvent({
        label: 'CHAT USO DO MICROFONE',
        action: 'CLICK_CANCELAR_AUDIO',
      });
    } else {
      onSendReactGAEvent({
        label: 'CHAT USO DO MICROFONE',
        action: 'CLICK_ENVIAR_AUDIO',
      });
    }
    accepted.current = acceptedClicked;
    setRecording(false);
  };

  const onStop = recordedBlob => {
    onStopRecording(recordedBlob, accepted.current);
  };

  useEffect(() => {
    const animation = setInterval(
      () => setOpacity(oldOpacity => (oldOpacity > 0 ? 0 : 1)),
      1000
    );

    return () => {
      clearInterval(animation);
    };
  }, []);

  const style = {
    display: 'flex',
    flexGrow,
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const style1 = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  const style2 = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  };
  const style3 = { opacity, padding: '2px 6px 0px 0px' };

  const style4 = { display: 'flex' };

  return (
    <div style={style}>
      <IconButton
        fill="true"
        key="cancelRecord"
        onClick={() => stopRecording(false)}
      >
        <Icon path={mdiCloseCircle} size={iconSize} color="red" />
      </IconButton>
      <div style={style4}>
        <ReactMic
          className={classes.reactMic}
          height={waveHeight}
          width={waveWidth}
          record={recording}
          onStop={onStop}
          strokeColor={defaultBlack}
          backgroundColor={defaultWhite}
          mimeType="audio/mp3"
          visualSetting="sinewave" // frequencyBars
        />
      </div>
      <div style={style1}>
        <div>
          <Typography variant="subtitle2" className={classes.recordingText}>
            GRAVANDO
          </Typography>
        </div>
        <div style={style2}>
          <Icon
            path={mdiCheckboxBlankCircle}
            size={0.5}
            color="red"
            style={style3}
          />
          <Timer formatValue={value => `${value < 10 ? `0${value}` : value}`}>
            <Typography variant="h6" className={classes.recordingTime}>
              <Timer.Minutes />:<Timer.Seconds />
            </Typography>
          </Timer>
        </div>
      </div>
      <IconButton
        fill="true"
        key="confirmRecord"
        onClick={() => stopRecording(true)}
      >
        <Icon path={mdiCheckCircle} size={iconSize} color="green" />
      </IconButton>
    </div>
  );
};

MicRecorder.defaultProps = {
  onStopRecording: undefined,
  iconSize: 1.5,
  flexGrow: 1,
  waveWidth: 200,
  waveHeight: 30,
};

MicRecorder.propTypes = {
  onStopRecording: PropTypes.func,
  iconSize: PropTypes.number,
  flexGrow: PropTypes.number,
  waveWidth: PropTypes.number,
  waveHeight: PropTypes.number,
};

export default MicRecorder;
