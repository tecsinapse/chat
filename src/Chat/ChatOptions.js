import {
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Popover,
} from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(() => ({
  listFont: {
    fontSize: "12px",
  },
}));

export const ChatOptions = ({ anchorEl, options, setAnchorEl }) => {
  const classes = useStyles();
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  return (
    <Popover open={open} anchorEl={anchorEl} onClose={handleClose}>
      <List>
        {options &&
          options.map((item) => (
            <ListItem button component="a" href={item.path}>
              <ListItemText
                primary={item.label}
                classes={{
                  primary: classes.listFont,
                }}
              />
            </ListItem>
          ))}
      </List>
    </Popover>
  );
};
