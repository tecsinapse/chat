import { Enum } from 'enumify';

class MESSAGE_STYLE extends Enum {}

MESSAGE_STYLE.initEnum({
  DEFAULT: {
    key: 'DEFAULT',
  },
  INFO: {
    key: 'INFO',
  },
});

MESSAGE_STYLE.isEquals = (key, enumm) => [enumm, enumm.key].includes(key);

export default MESSAGE_STYLE;
