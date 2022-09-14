import { makeStyles } from "@material-ui/styles";
import { defaultOrange } from "@tecsinapse/ui-kit/build/utils/colors";

export const useStyle = makeStyles((theme) => ({
  fabContainer: {
    zIndex: "999999",
    position: "fixed",
    right: 0,
    bottom: theme.spacing(2),
  },
  badgeAlign: {
    top: "7px",
    left: "7px",
  },
  fab: {
    borderRadius: "24px 0 0 24px",
    padding: 0,
    width: "48px",
    backgroundColor: defaultOrange,
  },
  fabProgress: {
    color: theme.palette.secondary.dark,
  },
}));
