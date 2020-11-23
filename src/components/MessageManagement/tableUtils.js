import React from "react";
import { Badge, ListItem, ListItemText, Typography } from "@material-ui/core";
import { format } from "../../utils/dates";
import { MessageSource } from "../../constants";
import RowActions from "@tecsinapse/table/build/Table/Rows/RowActions/RowActions";
import { encodeChatData } from "../../utils/encodeChatData";

export const generateAction = (
  row,
  showMessagesLabel,
  showDiscardOption,
  userkeycloakId,
  onSelectChat,
  setDeletingChat
) => {
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

  return actions;
};

export const generateColumns = (
  extraInfoColumns,
  mobile,
  showMessagesLabel,
  showDiscardOption,
  userkeycloakId,
  onSelectChat,
  setDeletingChat,
  classes
) => {
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
              actions={generateAction(
                row,
                showMessagesLabel,
                showDiscardOption,
                userkeycloakId,
                onSelectChat,
                setDeletingChat
              )}
              row={row}
              verticalActions={true}
              forceCollapseActions={true}
            />
          </Badge>
        );
      },
    });
  }

  return columns;
};

export const customActionsMobile = (
  data,
  onSelectChat,
  showMessagesLabel,
  customActions,
  userkeycloakId,
  setDrawerOpen,
  showDiscardOption,
  setDeletingChat
) => {
  return (
    <div>
      <ListItem onClick={() => onSelectChat(data)}>
        <ListItemText>{showMessagesLabel}</ListItemText>
      </ListItem>

      {(customActions ? customActions : data?.actions).map(
        (actionLink, key) => {
          const handleClick = () => {
            const encodedData = encodeChatData(data, userkeycloakId);
            if (actionLink.action) {
              setDrawerOpen(false);
              actionLink.action(encodedData);
            } else {
              window.open(`${actionLink.path}?data=${encodedData}`, "_self");
            }
          };
          return (
            <ListItem key={key} onClick={handleClick}>
              <ListItemText>{actionLink.label}</ListItemText>
            </ListItem>
          );
        }
      )}

      {showDiscardOption && (
        <ListItem onClick={() => setDeletingChat(data)}>
          <ListItemText>Descartar Conversa</ListItemText>
        </ListItem>
      )}
    </div>
  );
};
