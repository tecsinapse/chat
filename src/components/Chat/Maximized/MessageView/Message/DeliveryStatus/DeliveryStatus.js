import React from 'react';
import { Typography } from '@material-ui/core';

export const DeliveryStatus = ({
  message,
  classes,
  addMessageDate,
  showDate,
}) => (
  <>
    {(message.status !== 'sending' && message.status !== 'error') ||
    message.own === false ? (
      <>
        {(addMessageDate || showDate) && (
          <Typography variant="caption" className={classes.at}>
            {message.at}
          </Typography>
        )}
      </>
    ) : (
      <>
        {message.status === 'sending' && (
          <Typography variant="caption" className={classes.at}>
            Enviando...
          </Typography>
        )}
        {message.status === 'error' && (
          <Typography variant="caption" color="error">
            Erro no envio
          </Typography>
        )}
      </>
    )}
  </>
);
export default DeliveryStatus;
