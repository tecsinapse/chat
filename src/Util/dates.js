import moment from "moment";

export function format(dateTime) {
  let m;
  if (Array.isArray(dateTime)) {
    m = moment(dateTime.slice(0, 6));
  } else {
    m = moment(dateTime);
  }

  return m.isValid()
    ? m.format("DD/MM/YYYY HH:mm")
    : dateTime; // already formatted
}
