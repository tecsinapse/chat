import React from "react";
import { Badge, ListItem, ListItemText, Typography } from "@material-ui/core";
import RowActions from "@tecsinapse/table/build/Table/Rows/RowActions/RowActions";
import { format } from "../../utils/dates";
import { MessageSource } from "../../constants";
import { encodeChatData } from "../../utils/encodeChatData";
import { highlight } from "./globalSearch";

/* eslint-disable react/no-array-index-key */

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
  classes,
  globalSearch
) => {
  const columns = [
    {
      title: "Data do Contato",
      field: "contactAt",
      options: {
        sort: true,
      },
      customRender: (row) => highlight(globalSearch, format(row.contactAt)),
    },
    {
      title: "Cliente",
      field: "name",
      customRender: ({
        lastMessage,
        name,
        lastMessageSource,
        extraInfo,
        highlighted = false,
        subName,
      }) => {
        const renderLastMessage = lastMessage;

        const lastSender =
          renderLastMessage &&
          (MessageSource.isClient(lastMessageSource)
            ? name?.split(" ")[0]
            : extraInfo?.responsavel?.split(" ")[0]);
        const fontItalic = { fontStyle: "italic" };

        return (
          <>
            {highlighted ? (
              <span className={classes.highlighted}>
                {highlight(globalSearch, name)}
              </span>
            ) : (
              <span>{highlight(globalSearch, name)}</span>
            )}
            {subName && (
              <>
                <br />
                <span>{highlight(globalSearch, subName)}</span>
              </>
            )}
            <br />
            {renderLastMessage && (
              <Typography variant="caption" style={fontItalic}>
                {lastSender}: {highlight(globalSearch, lastMessage)}
              </Typography>
            )}
          </>
        );
      },
    },
    {
      title: "Telefone",
      field: "phone",
      customRender: (row) => highlight(globalSearch, row.phone),
    },
  ];

  if (extraInfoColumns && Object.keys(extraInfoColumns).length > 0) {
    Object.keys(extraInfoColumns).forEach((key) => {
      columns.push({
        title: extraInfoColumns[key],
        field: `extraInfo.${key}`,
        customRender: (row) =>
          highlight(globalSearch, row?.extraInfo[key] || ""),
      });
    });
  }

  if (!mobile) {
    columns.push({
      title: "Ações",
      field: "",
      customRender: (row) => {
        const { unread } = row;

        return (
          <Badge
            color="error"
            badgeContent={unread}
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
              verticalActions
              forceCollapseActions
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
) => (
  <div>
    <ListItem key="showMsg" onClick={() => onSelectChat(data)}>
      <ListItemText>{showMessagesLabel}</ListItemText>
    </ListItem>

    {(customActions || data?.actions || []).map((actionLink, key) => {
      const handleClick = () => {
        const encodedData = encodeChatData(data, userkeycloakId);

        if (actionLink.action) {
          setDrawerOpen(false);
          actionLink.action(data, encodedData);
        } else {
          window.open(`${actionLink.path}?data=${encodedData}`, "_self");
        }
      };

      return (
        <ListItem key={`item-${key}`} onClick={handleClick}>
          <ListItemText>
            {actionLink.action ? actionLink.label(data) : actionLink.label}
          </ListItemText>
        </ListItem>
      );
    })}

    {showDiscardOption && (
      <ListItem key="discardMsg" onClick={() => setDeletingChat(data)}>
        <ListItemText>Descartar Conversa</ListItemText>
      </ListItem>
    )}
  </div>
);
/* eslint-enable react/no-array-index-key */
