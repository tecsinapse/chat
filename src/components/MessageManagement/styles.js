import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles(() => ({
  container: {
    height: "100%",
    "& .MuiTablePagination-spacer": {
      display: "none",
    },
    "& .MuiTablePagination-toolbar": {
      paddingLeft: "18px",
    },
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
