import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
  },
  header: {
    padding: theme.spacing(1, 0, 3 / 4, 0),
  },
  preview: {
    backgroundColor: "#ccc",
    display: "flex",
    fontFamily: "monospace",
    margin: theme.spacing(1, 0),
    padding: theme.spacing(2),
    textAlign: "center",
    justifyContent: "center",
  },
  previewText: {
    textAlign: "center",
    display: "block",
    width: "31vW",
  },
}));
