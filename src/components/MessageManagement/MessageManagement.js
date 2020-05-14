import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Table } from "@tecsinapse/table";
import TableRowActions from "@tecsinapse/table/build/Table/TableRowActions";
import jwt from "jwt-simple";
import { format } from "../../utils/dates";
import { Badge } from "@material-ui/core";
import { TableHeader } from "./TableHeader";

const useStyle = makeStyles((theme) => ({
  highlighted: {
    fontWeight: "bold",
    color: "#e6433f",
  },
  badgeAlign: {
    top: "8px",
    right: "12px",
  },
}));

export const MessageManagement = ({
  componentInfo,
  onSelectChat,
  userkeycloakId,
}) => {
  const { extraInfoColumns, allChats = [] } = componentInfo;
  const [showClient, setShowClient] = useState(true);
  const [showNotClient, setShowNotClient] = useState(true);
  const [chats, setChats] = useState(allChats);

  useEffect(() => {
    setChats(
      (allChats.length > 1 &&
        allChats.filter((item) => {
          const noSwitch = !showClient && !showNotClient;
          return (
            !noSwitch &&
            (item.highlighted !== showClient ||
              item.highlighted === showNotClient)
          );
        })) ||
        []
    );
  }, [allChats, showClient, showNotClient]);

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
        <Badge
          color="error"
          badgeContent={row.unread}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          classes={{
            anchorOriginTopRightRectangle: classes.badgeAlign,
          }}
        >
          <TableRowActions
            actions={actions}
            row={row}
            verticalActions={true}
            forceCollapseActions={true}
          />
        </Badge>
      );
    },
  });

  return (
    <Table
      columns={columns}
      data={chats}
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
        title: (
          <TableHeader
            setShowClient={setShowClient}
            setShowNotClient={setShowNotClient}
            showClient={showClient}
            showNotClient={showNotClient}
          />
        ),
      }}
      hideSelectFilterLabel
    />
  );
};
