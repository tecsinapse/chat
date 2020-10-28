/* eslint-disable no-inline-styles/no-inline-styles */
import React from 'react';
import { Enum } from 'enumify';
import moment from 'moment';
import {
  defaultGreyLight5,
  defaultOrange,
  defaultRed,
} from '@tecsinapse/ui-kit';
import DoubleTickIcon from '../../../../assets/message-status-delivered.svg';
import SingleTickIcon from '../../../../assets/message-status-sent.svg';
import SendingIcon from '../../../../assets/message-status-sending.svg';
import ErrorIcon from '../../../../assets/message-status-error.svg';
import NotDeliveredIcon from '../../../../assets/message-status-not-delivered.svg';
import RejectedIcon from '../../../../assets/message-status-rejected.svg';

class DELIVERY_STATUS extends Enum {}

const defaultLabel = props =>
  moment(props?.at).format(props?.showDate ? 'DD/MM/YYYY HH:mm' : 'HH:mm');

DELIVERY_STATUS.initEnum({
  SENDING: {
    key: 'sending',
    label: () => 'Enviando...',
    icon: classes => (
      <SendingIcon
        className={classes}
        style={{ color: defaultGreyLight5, width: '20px', height: '20px' }}
      />
    ),
  },
  ERROR: {
    key: 'error',
    label: () => 'Erro ao enviar',
    icon: classes => (
      <ErrorIcon
        className={classes}
        style={{ fill: defaultRed, width: '10px', height: '10px' }}
      />
    ),
  },
  DELIVERED: {
    key: 'delivered',
    label: props => defaultLabel(props),
    icon: classes => (
      <DoubleTickIcon className={classes} style={{ fill: defaultGreyLight5 }} />
    ),
  },
  NOT_DELIVERED: {
    key: 'not_delivered',
    label: () => 'Não entregue',
    icon: classes => (
      <NotDeliveredIcon className={classes} style={{ fill: defaultOrange }} />
    ),
  },
  REJECTED: {
    key: 'rejected',
    label: () => 'Rejeitada',
    icon: classes => (
      <RejectedIcon className={classes} style={{ fill: defaultRed }} />
    ),
  },
  SENT: {
    key: 'sent',
    label: props => defaultLabel(props),
    icon: classes => (
      <SingleTickIcon className={classes} style={{ fill: defaultGreyLight5 }} />
    ),
  },
  READ: {
    key: 'read',
    label: props => defaultLabel(props),
    icon: classes => (
      <DoubleTickIcon className={classes} style={{ fill: '#4fc3f7' }} />
    ),
  },
});

DELIVERY_STATUS.keyNames = () =>
  Object.keys(DELIVERY_STATUS)
    .map(k => DELIVERY_STATUS[k].key)
    .filter(n => n);

DELIVERY_STATUS.get = (key = '') =>
  Object.keys(DELIVERY_STATUS)
    .map(k => DELIVERY_STATUS[k])
    .find(s => s.key && s.key.toLowerCase() === key.toLowerCase());

DELIVERY_STATUS.isEquals = (key, enumm) => [enumm, enumm.key].includes(key);

export default DELIVERY_STATUS;
