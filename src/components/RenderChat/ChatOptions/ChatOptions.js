import {
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Popover,
} from "@material-ui/core";
import React from "react";
import { encodeChatData } from "../../../utils/encodeChatData";

const useStyles = makeStyles(() => ({
  listFont: {
    fontSize: "12px",
  },
}));

export const ChatOptions = ({
  anchorEl,
  options,
  setAnchorEl,
  data,
  userkeycloakId,
  setDrawerOpen,
}) => {
  const classes = useStyles();
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const encodedData = encodeChatData(data, userkeycloakId);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <List>
        {options &&
          options.map((item) => {
            const handleClick = () => {
              if (item.action) {
                setDrawerOpen(false);
                item.action(encodedData);
              } else {
                window.open(`${item.path}?data=${encodedData}`, "_self");
              }
            };
            return (
              <ListItem
                key={item.label}
                button
                component="a"
                onClick={handleClick}
              >
                <ListItemText
                  primary={item.label}
                  classes={{
                    primary: classes.listFont,
                  }}
                />
              </ListItem>
            );
          })}
      </List>
    </Popover>
  );
};
