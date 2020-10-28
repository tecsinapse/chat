import React from 'react';
import { Typography } from '@material-ui/core';
import { DELIVERY_STATUS } from '../../../../constants';

const renderStatus = ({ statusProps, classes, deliveryStatus, showDate }) => (
  <>
    <div className={classes.messageStatusContainer}>
      <span className={classes.messageStatusAtContainer}>
        <Typography variant="caption" className={classes.at}>
          {deliveryStatus.label({ ...statusProps, showDate })}
        </Typography>
      </span>
      {deliveryStatus.icon(classes.messageStatusIcon)}
    </div>
  </>
);

export const DeliveryStatus = ({
  message,
  classes,
  addMessageDate,
  showDate,
}) => {
  const { status, statusDetails = [], own, at } = message;

  if (!own) {
    return (
      <>
        {(addMessageDate || showDate) && (
          <Typography variant="caption" className={classes.at}>
            {at}
          </Typography>
        )}
      </>
    );
  }

  const deliveryStatus = DELIVERY_STATUS.get(status);
  const statusProps =
    statusDetails.find(s => s.status.toLowerCase() === status.toLowerCase()) ||
    {};

  return renderStatus({
    statusProps,
    classes,
    deliveryStatus,
    showDate,
  });
};
export default DeliveryStatus;
