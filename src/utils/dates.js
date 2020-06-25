import moment from "moment";

export function format(dateTime) {
  const m = toMoment(dateTime);
  return m.isValid()
    ? m.format("DD/MM/YYYY HH:mm")
    : dateTime; // already formatted
}

export function toMoment(dateTime) {
  if (Array.isArray(dateTime)) {
    let arr = [...dateTime.slice(0, 6)];
    // moment expects month to be 0 - 11
    arr[1] = arr[1] - 1;
    return moment(arr);
  } else {
    return moment(dateTime);
  }
}
