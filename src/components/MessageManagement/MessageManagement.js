import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Table } from "@tecsinapse/table";
import RowActions from "@tecsinapse/table/build/Table/Rows/RowActions/RowActions";
import { format, toMoment } from "../../utils/dates";
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Drawer,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { TableHeader } from "./TableHeader";
import { encodeChatData } from "../../utils/encodeChatData";
import { MessageSource } from "../../constants";

const useStyle = makeStyles(() => ({
  highlighted: {
    fontWeight: "bold",
    color: "#e6433f",
  },
  badgeAlign: {
    top: "8px",
    right: "12px",
  },
}));

const sortChatsByContactAt = (allChats) =>
  allChats.sort((a, b) => {
    const contactA = toMoment(a?.contactAt);
    const contactB = toMoment(b?.contactAt);
    if (contactA > contactB) return -1;
    else if (contactA < contactB) return 1;
    else return 0;
  });

export const MessageManagement = ({
  componentInfo,
  onSelectChat,
  onDeleteChat,
  userkeycloakId,
  showMessagesLabel,
  showDiscardOption,
  headerClass,
  mobile,
  customActions,
}) => {
  const { extraInfoColumns, allChats = [] } = componentInfo;
  const [chats, setChats] = useState(sortChatsByContactAt(allChats));
  const [showOnlyNotClients, setShowOnlyNotClients] = useState(false);
  const [deletingChat, setDeletingChat] = useState({});
  const [selectedRow, setSelectedRow] = useState();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const extraActions = customActions ? customActions : selectedRow?.actions;

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
        sort: true,
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
        const renderLastMessage = row.lastMessage;

        const lastSender =
          renderLastMessage &&
          (MessageSource.isClient(row?.lastMessageSource)
            ? row?.name?.split(" ")[0]
            : row?.extraInfo?.responsavel?.split(" ")[0]);
        const fontItalic = { fontStyle: "italic" };

        return (
          <>
            {row.highlighted ? (
              <span className={classes.highlighted}>{row.name}</span>
            ) : (
              <span>{row.name}</span>
            )}
            {row.subName && (
              <>
                <br />
                <span>{row.subName}</span>
              </>
            )}
            <br />
            {renderLastMessage && (
              <Typography variant="caption" style={fontItalic}>
                {lastSender}: {row?.lastMessage}
              </Typography>
            )}
          </>
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

  if (!mobile) {
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
        if (showDiscardOption) {
          actions.push({
            label: "Descartar Conversa",
            onClick: (rowData) => {
              setDeletingChat(rowData);
            },
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
            <RowActions
              actions={actions}
              row={row}
              verticalActions={true}
              forceCollapseActions={true}
            />
          </Badge>
        );
      },
    });
  }

  const deleteChat = () => {
    onDeleteChat(deletingChat).then((updatedAllChats) => {
      setDeletingChat({});
      setChats(updatedAllChats);
    });
  };

  const exportToCSV = () => {
    let fileNameWithExt = "gestao-mensagens.csv";

    const exportedColumns = ["Data do Contato", "Cliente", "Telefone"];
    Object.keys(extraInfoColumns).forEach((key) => {
      exportedColumns.push(extraInfoColumns[key]);
    });

    const dataToExport = [];
    chats.forEach((chat) => {
      const row = [format(chat.lastMessageAt), chat.name, chat.phone];
      Object.keys(extraInfoColumns).forEach((key) => {
        row.push(chat.extraInfo[key]);
      });
      dataToExport.push(row.join(";"));
    });

    dataToExport.splice(0, 0, exportedColumns.join(";"));

    const csvData = dataToExport.join("\n");
    const csvFile = window.URL.createObjectURL(
      new Blob(["\ufeff", csvData], { type: "text/csv;charset=utf-8;" })
    );

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(csvFile, fileNameWithExt);
    } else {
      const hiddenElement = document.createElement("a");

      hiddenElement.href = csvFile;
      hiddenElement.target = "_blank";
      hiddenElement.download = fileNameWithExt;
      hiddenElement.style.visibility = "hidden";
      document.body.appendChild(hiddenElement);
      hiddenElement.click();
      document.body.removeChild(hiddenElement);
    }
  };

  return (
    <>
      <Table
        onDrawerClose={() => {}}
        onRowClick={(data) => {
          if (mobile) {
            setSelectedRow(data);
            setBottomSheetOpen(true);
          }
        }}
        columns={columns}
        data={chats}
        rowId={(row) => row.id}
        pagination
        exportOptions={
          !mobile
            ? {
                exportFileName: "chat-mensagens",
                exportTypes: [
                  {
                    label: "Exportar para CSV",
                    type: "custom",
                    exportFunc: () => exportToCSV(),
                  },
                ],
              }
            : {}
        }
        toolbarOptions={{
          title: (
            <TableHeader
              showNotClient={showOnlyNotClients}
              switchToOnlyNotClients={switchToOnlyNotClients}
              headerClass={headerClass}
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
          <DialogContentText>Descartar a conversa?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setDeletingChat({})} color="primary">
            Não
          </Button>
          <Button onClick={deleteChat} color="primary" autoFocus>
            Sim
          </Button>
        </DialogActions>
      </Dialog>

      {mobile && (
        <Drawer
          anchor="bottom"
          open={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
        >
          <div>
            <ListItem onClick={() => onSelectChat(selectedRow)}>
              <ListItemText>{showMessagesLabel}</ListItemText>
            </ListItem>

            {extraActions?.map((actionLink, key) => {
              return (
                <ListItem
                  key={key}
                  onClick={() => {
                    const encodedData = encodeChatData(
                      selectedRow,
                      userkeycloakId
                    );
                    window.open(
                      `${actionLink.path}?data=${encodedData}`,
                      "_self"
                    );
                  }}
                >
                  <ListItemText>{actionLink.label}</ListItemText>
                </ListItem>
              );
            })}

            {showDiscardOption && (
              <ListItem onClick={() => setDeletingChat(selectedRow)}>
                <ListItemText>Descartar Conversa</ListItemText>
              </ListItem>
            )}
          </div>
        </Drawer>
      )}
    </>
  );
};