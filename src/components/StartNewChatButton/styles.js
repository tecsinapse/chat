import { makeStyles } from "@material-ui/styles";

export const useStyle = makeStyles(() => ({
  floatingButton: {
    zIndex: "999999",
    position: "fixed",
    bottom: 15,
    right: 30,
  },
}));
