import Icon from '@mdi/react';
import { mdiClose, mdiInformation } from '@mdi/js';
import { Typography } from '@material-ui/core';
import { IconButton } from '@livechat/ui-kit';
import React, { useEffect, useState } from 'react';
import { isStringNotBlank } from '@tecsinapse/es-utils/build/object';
import { makeStyles } from '@material-ui/styles';

const useStyle = makeStyles(({ spacing }) => ({
  rootDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: spacing(5 / 12, 1, 5 / 12, 1.5),
    alignItems: 'center',
    backgroundColor: ({ isWarning }) => (isWarning ? '#f69c00' : '#fa1854'),
  },
  textDiv: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typo: { fontSize: '14px', color: '#fff', fontWeight: 400 },
}));

export const Warning = ({ errorMessage, warningMessage, isBlocked }) => {
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    setShowWarning(
      isBlocked ||
        isStringNotBlank(errorMessage) ||
        isStringNotBlank(warningMessage)
    );
  }, [isBlocked, warningMessage, errorMessage]);

  const isWarning = isStringNotBlank(warningMessage);

  const classes = useStyle({ isWarning });

  const error = isStringNotBlank(errorMessage) && errorMessage;
  const warning = isWarning && warningMessage;
  const blocked = isBlocked && (
    <>
      O envio de mensagem expirou por <strong>inatividade</strong>.
    </>
  );

  const warningText = error || warning || blocked;

  if (!showWarning) {
    return null;
  }

  const marginRight = { marginRight: '8px' };

  return (
    <div className={classes.rootDiv}>
      <div className={classes.textDiv}>
        <Icon
          path={mdiInformation}
          size={0.8}
          style={marginRight}
          color="#fff"
        />
        <Typography className={classes.typo}>{warningText}</Typography>
      </div>
      <IconButton onClick={() => setShowWarning(false)}>
        <Icon path={mdiClose} size={0.8} color="#fff" />
      </IconButton>
    </div>
  );
};
