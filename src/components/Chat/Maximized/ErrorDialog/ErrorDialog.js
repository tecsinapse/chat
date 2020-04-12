import React from 'react';
import { Typography } from '@material-ui/core';
import { mdiClose, mdiAlertCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton as IconButtonMaterial } from '@tecsinapse/ui-kit/build/Buttons/IconButton';

export const ErrorDialog = ({ classes, theme, error, setShowError }) => (
  <div className={classes.errorDiv}>
    <div className={classes.errorDivIcon}>
      <Icon path={mdiAlertCircle} size={0.75} color="white" />
    </div>
    <div className={classes.errorDivText}>
      <Typography variant="body2">{error}</Typography>
    </div>
    <IconButtonMaterial key="close" onClick={() => setShowError(false)}>
      <Icon
        path={mdiClose}
        size={0.75}
        color={theme.palette.primary.contrastText}
      />
    </IconButtonMaterial>
  </div>
);
export default ErrorDialog;
