import Icon from '@mdi/react';
import { mdiClose, mdiInformation } from '@mdi/js';
import { Typography } from '@material-ui/core';
import { IconButton } from '@livechat/ui-kit';
import React, { useEffect, useState } from 'react';
import { isStringNotBlank } from '@tecsinapse/es-utils/build/object';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';

const useStyle = makeStyles(({ spacing }) => ({
  rootDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: spacing(5 / 12, 1, 5 / 12, 1.5),
    alignItems: 'center',
  },
  errorColor: {
    backgroundColor: '#f44336',
  },
  warningColor: {
    backgroundColor: '#ff9800',
  },
  infoColor: {
    backgroundColor: '#fff5c4',
  },
  blockedColor: {
    backgroundColor: '#ff9800',
  },
  textDiv: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textIcon: {
    margin: '4px 5px 5px 0px',
  },
  closeIcon: {
    marginTop: '5px',
  },
  typo: {
    fontSize: '14px',
    color: '#fff',
    fontWeight: 400,
  },
  typoDense: {
    fontSize: '12px',
    color: '#fff',
  },
  typoInfo: {
    fontSize: '13px',
    color: '#303030',
    '& a': {
      fontWeight: 500,
      textDecoration: 'underline',
      color: '#303030',
      '&:hover': {
        opacity: 0.8,
      },
    },
  },
}));

export const Warning = ({
  className,
  errorMessage,
  warningMessage,
  infoMessage,
  blockedMessage,
  isBlocked,
  isShowIcon = true,
  isClosable = true,
  isDense = false,
}) => {
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    setShowWarning(
      isBlocked ||
        isStringNotBlank(errorMessage) ||
        isStringNotBlank(warningMessage) ||
        isStringNotBlank(infoMessage)
    );
  }, [isBlocked, infoMessage, warningMessage, errorMessage]);

  const isError = isStringNotBlank(errorMessage);
  const isWarning = isStringNotBlank(warningMessage);
  const isInfo = isStringNotBlank(infoMessage);

  const classes = useStyle();

  const error = isError && errorMessage;
  const warning = isWarning && warningMessage;
  const info = isInfo && infoMessage;
  const blocked = isBlocked && blockedMessage;

  const warningText = error || warning || info || blocked;

  if (!showWarning) {
    return null;
  }

  return (
    <div
      className={clsx(className, classes.rootDiv, {
        [classes.errorColor]: isError,
        [classes.warningColor]: isWarning,
        [classes.infoColor]: isInfo,
        [classes.blockedColor]: isBlocked,
        [classes.rootDivDense]: isDense,
      })}
    >
      <div className={classes.textDiv}>
        {isShowIcon && (
          <Icon
            path={mdiInformation}
            size={isDense ? 0.7 : 0.8}
            className={classes.textIcon}
            color="#fff"
          />
        )}
        <Typography
          className={clsx(classes.typo, {
            [classes.typoDense]: isDense,
            [classes.typoInfo]: isInfo,
          })}
        >
          {warningText}
        </Typography>
      </div>
      {isClosable && (
        <IconButton onClick={() => setShowWarning(false)}>
          <Icon
            path={mdiClose}
            size={isDense ? 0.6 : 0.8}
            className={classes.closeIcon}
            color="#fff"
          />
        </IconButton>
      )}
    </div>
  );
};
