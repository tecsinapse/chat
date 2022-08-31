import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(1, 2, 3 / 4, 2),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.grey["300"],
    },
  },
  chatIcon: {
    marginTop: "3px",
    color: theme.palette.primary.main
  },
  chevronIcon: {
    cursor: "pointer",
  },
}));
