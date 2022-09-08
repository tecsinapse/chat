import { makeStyles } from "@material-ui/styles";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";

export const useStyle = (view) =>
  makeStyles((theme) => ({
    drawerContainer: {
      fontFamily:
        "font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI , Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
      padding: theme.spacing(2, 0, 0, 0),
      height: "100%",
      overflowX: "hidden",
      maxWidth: "80vw",
      minWidth:
        view === COMPONENT_VIEW.MESSAGE_MANAGEMENT ? "80vw" : "40vw",
      width: "unset",
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
  }));
