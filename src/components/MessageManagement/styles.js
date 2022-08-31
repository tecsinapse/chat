import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles(({ spacing }) => ({
  container: {
    height: "100%",
  },
  loadingContainer: {
    top: "35%",
    position: "relative",
  },
  toolbarContainer: {
    display: "flex",
  },
  toolbarAppVersion: {
    marginTop: "6px",
    right: "10px",
    position: "absolute",
  },
  toolbarSwitch: {
    marginLeft: "0px",
  },
  toolbarSwitchLabel: {
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeAlign: {
    top: "8px",
    right: "12px",
  },
}));
