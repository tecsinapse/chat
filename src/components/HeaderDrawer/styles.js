import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles((theme) => ({
  headerContainer: {
    margin: theme.spacing(0, 2, 20 / 12, 2),
  },
  backIconContainer: {
    marginRight: theme.spacing(1),
  },
  backIcon: {
    cursor: "pointer",
    marginLeft: "-8px",
    color: theme.palette.primary.main,
  },
  soundIcon: {
    cursor: "pointer",
    color: theme.palette.primary.main,
  },
  closeIcon: {
    cursor: "pointer",
    color: theme.palette.primary.main,
  },
  wingoLogo: {
    height: "1.5rem",
    marginTop: "0.5rem",
  },
}));
