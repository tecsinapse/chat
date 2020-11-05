import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles((theme) => ({
  drawerContainer: {
    fontFamily:
      "font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI , Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
    margin: theme.spacing(2, 0, 0, 0),
    height: "100%",
    overflowX: "hidden",
    maxWidth: "80vw",
    minWidth: "40vw",
    /* TODO verificar uma forma melhor */
    /* Limpando estilos do Bootstrap para os inputs */
    "& input": {
      border: "0 !important",
      margin: 0,
      paddingTop: "10.5px",
      paddingBottom: "10.5px",
    },
    "& input:focus": {
      border: "0 !important",
      borderColor: "#fff",
      boxShadow: "none",
    },
    "& textarea": {
      border: "0 !important",
      margin: 0,
      paddingTop: "10.5px",
      paddingBottom: "10.5px",
    },
    "& textarea:focus": {
      border: "0 !important",
      borderColor: "#fff",
      boxShadow: "none",
    },
  },
  drawerHeader: {
    margin: theme.spacing(0, 2, 20 / 12, 2),
  },
  messageManagementLinkContainer: {
    padding: theme.spacing(1, 2, 3 / 4, 2),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.grey["300"],
    },
  },
  title: {
    padding: 0,
  },
}));
