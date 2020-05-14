import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Table } from "@tecsinapse/table";
import TableRowActions from "@tecsinapse/table/build/Table/TableRowActions";
import jwt from "jwt-simple";
import {format} from "../Util/dates";

const useStyle = makeStyles((theme) => ({
  highlighted: {
    fontWeight: "bold",
    color: "#ff0050",
  },
}));

export const MessageManagement = ({
  componentInfo,
  onSelectChat,
  userkeycloakId,
}) => {
  const classes = useStyle();

  const columns = [
    {
      title: "Data do Contato",
      field: "contactAt",
      options: {
        filter: true,
      },
      customRender: (row) => format(row.contactAt),
    },
    {
      title: "Cliente",
      field: "name",
      options: {
        filter: true,
      },
      customRender: (row) => {
        return row.highlighted ? (
          <span className={classes.highlighted}>{row.name}</span>
        ) : (
          row.name
        );
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
              const encodedData = jwt.encode(
                { data: JSON.stringify(rowData) },
                userkeycloakId,
                "HS256"
              );
              window.open(`${actionLink.path}?data=${encodedData}`, "_self");
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
  );
};
