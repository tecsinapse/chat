import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 0, 0, 2),
    backgroundColor: theme.palette.grey[100],
  },
  header: {
    padding: theme.spacing(1, 0, 3 / 4, 0),
  },
  contactListName: {
    paddingBottom: "5px",
  },
  contactListMessage: {
    justifyContent: "space-between",
  },
  contactListNotification: {
    height: "16px",
    width: "16px",
    borderRadius: "10px",
    backgroundColor: "#e6433f",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    flexShrink: 0,
  },
  itemText1: {
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "14px",
  },
  itemText2: {
    textTransform: "capitalize",
    fontSize: "12px",
    fontWeight: "500",
    letterSpacing: "-0.1px",
  },
  itemText3: {
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: "10px",
    letterSpacing: "-0.1px",
    marginTop: "5px",
  },
  itemText4: {
    fontSize: "13px",
    letterSpacing: "-0.25px",
    marginTop: theme.spacing(3 / 4),
    maxWidth: theme.spacing(28),
  },
  notificationBadgeText: {
    fontWeight: 900,
    fontSize: "11px",
  },
  border: {
    borderBottom: "1px solid #ccc",
    "&:last-child": {
      borderBottom: "none",
    },
  },
}));
