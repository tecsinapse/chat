import { makeStyles } from "@material-ui/styles";
import { defaultOrange } from "@tecsinapse/ui-kit/build/utils/colors";

export const useStyle = makeStyles(() => ({
  floatingButton: {
    zIndex: "999999",
    position: "fixed",
    bottom: 40,
    right: 40,
  },
}));
