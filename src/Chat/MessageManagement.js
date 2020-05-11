import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Table } from "@tecsinapse/table";
import TableRowActions from "@tecsinapse/table/build/Table/TableRowActions";

const useStyle = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 2),
  },
}));

export const MessageManagement = ({ componentInfo, onSelectChat }) => {
  const classes = useStyle();

  const columns = [
    {
      title: "Data do Contato",
      field: "contactAt",
      options: {
        filter: true,
      },
    },
    {
      title: "Cliente",
      field: "name",
      options: {
        filter: true,
      },
      customRender: (row) => {
        return row.highlighted ? <strong>{row.name}</strong> : row.name;
      },
    },
    {
      title: "Telefone",
      field: "phone",
      options: {
        filter: true,
      },
    },
  ];

  const { extraInfoColumns } = componentInfo;
  if (extraInfoColumns && Object.keys(extraInfoColumns).length > 0) {
    Object.keys(extraInfoColumns).forEach((key) => {
      columns.push({
        title: extraInfoColumns[key],
        field: `extraInfo.${key}`,
        options: {
          filter: true,
        },
      });
    });
  }

  columns.push({
    title: "Ações",
    field: "",
    customRender: (row) => {
      const actions = [
        {
          label: "Visualizar Mensagens",
          onClick: (rowData) => {
            onSelectChat(rowData);
          },
        },
      ];
      if (row.actions && row.actions.length > 0) {
        row.actions.forEach((actionLink) => {
          actions.push({
            label: actionLink.label,
            onClick: (rowData) => {
              window.open(
                `${actionLink.path}?data=${JSON.stringify(rowData)}`,
                "_self"
              );
            },
          });
        });
      }

      return (
        <TableRowActions
          actions={actions}
          row={row}
          verticalActions={true}
          forceCollapseActions={true}
        />
      );
    },
  });

  return (
    <div className={classes.root}>
      <Table
        columns={columns}
        data={componentInfo.allChats}
        rowId={(row) => row.id}
        pagination
        exportOptions={{
          exportTypes: [
            {
              type: "csv",
            },
          ],
        }}
        toolbarOptions={{
          title: "Clientes do Chat",
        }}
        hideSelectFilterLabel
      />
    </div>
  );
};
