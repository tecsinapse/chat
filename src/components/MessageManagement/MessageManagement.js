import React, {useState} from "react";
import {makeStyles} from "@material-ui/styles";
import {Table} from "@tecsinapse/table";
import TableRowActions from "@tecsinapse/table/build/Table/TableRowActions";
import {format} from "../../utils/dates";
import {Badge, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {TableHeader} from "./TableHeader";
import {encodeChatData} from "../../utils/encodeChatData";

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
                                    onDeleteChat,
                                    userkeycloakId,
                                    showMessagesLabel
                                  }) => {
  const {extraInfoColumns, allChats = []} = componentInfo;
  const [showOnlyNotClients, setShowOnlyNotClients] = useState(false);
  const [chats, setChats] = useState(allChats);
  const [deletingChat, setDeletingChat] = useState({});

  const switchToOnlyNotClients = () => {
    const showOnly = !showOnlyNotClients;
    if (showOnly) {
      setChats([...allChats].filter((it) => it.highlighted));
    } else {
      setChats([...allChats]);
    }
    setShowOnlyNotClients(showOnly);
  };

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
          label: showMessagesLabel,
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
              const encodedData = encodeChatData(rowData, userkeycloakId);
              window.open(`${actionLink.path}?data=${encodedData}`, "_self");
            },
          });
        });
      }
      actions.push({
        label: "Descartar Conversa",
        onClick: (rowData) => {
          setDeletingChat(rowData);
        },
      });

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

  const deleteChat = () => {
    onDeleteChat(deletingChat)
      .then((updatedAllChats) => {
        setDeletingChat({});
        setChats(updatedAllChats);
      });
  };

  return (
    <>
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
              showNotClient={showOnlyNotClients}
              switchToOnlyNotClients={switchToOnlyNotClients}
            />
          ),
        }}
        hideSelectFilterLabel
      />
      <Dialog
        open={deletingChat && Object.keys(deletingChat).length > 0}
        onClose={() => setDeletingChat({})}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">{"Confirmação"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirma descartar essa Conversa?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setDeletingChat({})} color="primary">
            Não
          </Button>
          <Button
            onClick={deleteChat}
            color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
