import {
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Popover,
} from "@material-ui/core";
import React from "react";
import {encodeChatData} from "../../../utils/encodeChatData";

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
          options.map((item) => (
            <ListItem
              key={item.label}
              button
              component="a"
              href={`${item.path}?data=${encodedData}`}
            >
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
