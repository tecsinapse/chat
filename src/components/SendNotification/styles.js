import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles((theme) => ({
  container: {
    height: "100%",
  },
  sendContainer: {
    padding: theme.spacing(2),
  },
  loadingContainer: {
    top: "35%",
    position: "relative",
  },
  preview: {
    backgroundColor: "#ccc",
    display: "grid",
    margin: theme.spacing(1, 0),
    padding: theme.spacing(2),
    textAlign: "center",
    justifyContent: "center",
  },
  previewText: {
    fontSize: "14px",
    lineHeight: 1.5,
    textAlign: "center",
    display: "block",
    width: "31vW",
  },
  previewButtons: {
    marginTop: theme.spacing(1),
    "& button": {
      letterSpacing: 0,
      textTransform: "none",
    },
  },
  connectionKeys: {
    zIndex: 999999,
  },
  customFieldInput: {
    zIndex: 999997,
  },
  customFieldSelect: {
    zIndex: 999997,
  },
  templates: {
    zIndex: 999998,
    "& #message-template  .MuiInputBase-input": {
      padding: "10px 0 10px 16px !important",
    },
  },
  newTemplateButtonEnable: {
    backgroundColor: "#272727",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    height: "36px",
    borderRadius: "0px 4px 4px 0px",
  },
  newTemplateButtonDisable: {
    backgroundColor: "#cccccc",
    height: "36px",
    borderRadius: "0px 4px 4px 0px",
  },
}));
