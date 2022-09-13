import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles((theme) => ({
  container: {
    top: "30%",
    position: "relative",
    maxWidth: "40vW",
    alignItems: "center",
    textAlign: "center",
    padding: "15px 0",
  },
  messageIcon: {
    color: theme.palette.secondary.light,
  },
  message: {
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(5),
  },
  subMessage: {
    fontSize: "12px",
    marginLeft: theme.spacing(10),
    marginRight: theme.spacing(10),
  },
}));
