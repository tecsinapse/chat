import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles(() => ({
  highlighted: {
    fontWeight: "bold",
    color: "#e6433f",
  },
  badgeAlign: {
    top: "8px",
    right: "12px",
  },
  rootMobile: {
    paddingTop: "1px",
    height: "calc(100vh - 218px)",
  },
}));
