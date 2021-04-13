import { makeStyles } from "@material-ui/styles";

export const useStyle = (customize, mobile) =>
  makeStyles((theme) => {
    const webPadding = !mobile
      ? { paddingTop: "10.5px", paddingBottom: "10.5px" }
      : {};
    const defaultStyle = {
      drawerContainer: {
        fontFamily:
          "font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI , Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
        padding: theme.spacing(2, 0, 0, 0),
        height: "100%",
        overflowX: "hidden",
        maxWidth: mobile ? "unset" : "80vw",
        minWidth: mobile ? "unset" : "40vw",
        width: mobile ? "100vw" : "unset",
        /* Limpando estilos do Bootstrap para os inputs */
        "& input": {
          border: "0 !important",
          margin: 0,
          ...webPadding,
        },
        "& input:focus": {
          border: "0 !important",
          borderColor: "#fff",
          boxShadow: "none",
        },
        "& textarea": {
          border: "0 !important",
          margin: 0,
          ...webPadding,
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
      messageManagementHeader: mobile
        ? {
            flexDirection: "column",
            padding: "0 15px",
          }
        : {},
    };
    const customStyle = customize ? customize(defaultStyle, theme) : {};

    return { ...defaultStyle, ...customStyle };
  });
