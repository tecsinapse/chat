import React from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import { DELIVERY_STATUS, MESSAGE_STYLE } from '../../../../constants';

const renderStatus = ({
  statusProps,
  classes,
  deliveryStatus,
  messageAt,
  showDate,
}) => (
  <>
    <div className={classes.messageStatusContainer}>
      <span className={classes.messageStatusAtContainer}>
        <Typography variant="caption" className={classes.at}>
          {deliveryStatus?.label({
            status: statusProps.status,
            at: messageAt,
            showDate,
          })}
        </Typography>
      </span>
      {statusProps.statusMessage && (
        <Tooltip title={statusProps.statusMessage} placement="bottom-end" arrow>
          <span>{deliveryStatus?.icon(classes.messageStatusIcon)}</span>
        </Tooltip>
      )}
      {!statusProps.statusMessage && (
        <span>{deliveryStatus?.icon(classes.messageStatusIcon)}</span>
      )}
    </div>
  </>
);

export const DeliveryStatus = ({
  message,
  classes,
  addMessageDate,
  showDate,
}) => {
  const { status, statusDetails = [], own, at: messageAt, style } = message;

  if (MESSAGE_STYLE.isEquals(style, MESSAGE_STYLE.INFO)) {
    return null;
  }

  if (!own) {
    return (
      <>
        {(addMessageDate || showDate) && (
          <Typography variant="caption" className={classes.at}>
            {messageAt}
          </Typography>
        )}
      </>
    );
  }

  const deliveryStatus = DELIVERY_STATUS.get(status);
  const statusProps =
    statusDetails.find(({ status: detailStatus }) =>
      DELIVERY_STATUS.isEquals(detailStatus, deliveryStatus)
    ) || {};

  return renderStatus({
    messageAt,
    statusProps,
    classes,
    deliveryStatus,
    showDate,
  });
};

export default DeliveryStatus;
