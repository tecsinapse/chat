import moment from "moment-timezone";

const TIME_ZONE = "America/Sao_Paulo";
const MOMENT_FORMAT = "DD/MM/YYYY HH:mm";

function momentNormalize(_moment) {
  return _moment.tz(TIME_ZONE, true);
}

export function format(dateTime) {
  const m = toMoment(dateTime);

  return m.isValid() ? m.format(MOMENT_FORMAT) : dateTime; // already formatted
}

export function toMoment(dateTime) {
  if (Array.isArray(dateTime)) {
    const arr = [...dateTime.slice(0, 6)];

    // moment expects month to be 0 - 11
    arr[1] -= 1;

    return momentNormalize(moment(arr));
  }

  return momentNormalize(moment(dateTime));
}

export const stringFormattedToMoment = (value) =>
  momentNormalize(moment(value, MOMENT_FORMAT));

export const momentNow = () => moment().tz(TIME_ZONE);
