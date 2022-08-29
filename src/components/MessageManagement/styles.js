import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles(() => ({
  display: {
    display: "flex",
  },
  input: {
    marginTop: 6,
    width: "105vw",
    left: -20,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  appVersion: {
    marginTop: 6,
    right: 10,
    position: "absolute",
  },
  highlighted: {
    fontWeight: "bold",
    color: "#e6433f",
  },
  badgeAlign: {
    top: "8px",
    right: "12px",
  },
}));
