import React from "react";
import {makeStyles} from "@material-ui/styles";
import {Table} from '@tecsinapse/table';

const useStyle = makeStyles(theme => ({
  root: {
    padding: theme.spacing(0, 2),
  },
}));

export const MessageManagement = ({
                                    componentInfo,
                                    onSelectChat
                                  }) => {
  const classes = useStyle();

  const columns = [{
    title: 'Data do Contato',
    field: 'contactAt',
    options: {
      filter: true
    },
  }, {
    title: 'Cliente',
    field: 'name',
    options: {
      filter: true,
    },
    customRender: (row) => {
      return row.highlighted ? <strong>{row.name}</strong> : row.name;
    }
  }, {
    title: 'Telefone',
    field: 'phone',
    options: {
      filter: true
    }
  }];

  const {extraInfoColumns} = componentInfo;
  if (extraInfoColumns && Object.keys(extraInfoColumns).length > 0) {
    Object.keys(extraInfoColumns).forEach((key) => {
      columns.push({
        title: extraInfoColumns[key],
        field: `extraInfo.${key}`,
        options: {
          filter: true
        }
      });
    });
  }

  const actions = [{
    label: 'Visualizar Mensagens',
    onClick: (rowData) => {
      onSelectChat(rowData);
    }
  }];
  const {actionLinks} = componentInfo;
  if (actionLinks && actionLinks.length > 0) {
    actionLinks.forEach((actionLink) => {
      actions.push({
        label: actionLink.label,
        onClick: (rowData) => {
          window.open(`${actionLink.path}?data=${JSON.stringify(rowData)}`, '_self');
        }
      })
    })
  }

  return (
    <div className={classes.root}>
      <Table columns={columns}
             data={componentInfo.allChats}
             rowId={row => row.id}
             pagination
             exportOptions={{
               exportTypes: [{
                 type: 'csv'
               }]
             }}
             toolbarOptions={{
               title: 'Clientes do Chat'
             }}
             verticalActions
             actions={actions}/>
    </div>
  );
};
