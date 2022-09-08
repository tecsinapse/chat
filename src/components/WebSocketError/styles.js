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
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
  },
}));
