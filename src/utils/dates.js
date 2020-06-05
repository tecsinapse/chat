import moment from "moment";

export function format(dateTime) {
  let m;
  if (Array.isArray(dateTime)) {
    let arr = [...dateTime.slice(0, 6)];
    // moment expects month to be 0 - 11
    arr[1] = arr[1] - 1;
    m = moment(arr);
  } else {
    m = moment(dateTime);
  }

  return m.isValid()
    ? m.format("DD/MM/YYYY HH:mm")
    : dateTime; // already formatted
}
