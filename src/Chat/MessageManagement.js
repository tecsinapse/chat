import React from "react";
import {makeStyles, useTheme} from "@material-ui/styles";
import {cars} from "@tecsinapse/table/build/Table/exampleData";
import {columnsSimple} from '@tecsinapse/table/build/Table/storyHelper';
import {Table} from '@tecsinapse/table';

const useStyle = makeStyles(theme => ({
  root: {
    padding: theme.spacing(0, 0, 2, 2),
  },
}));

export const MessageManagement = ({
                                    chats,
                                    onSelectChat
                                  }) => {
  const classes = useStyle();
  const theme = useTheme();

  return (
    <div className={classes.root}>
      <Table columns={columnsSimple} data={cars} rowId={row => row.id} onRowClick={rowData => {
        console.log(rowData);
      }}/>
    </div>
  );
};
