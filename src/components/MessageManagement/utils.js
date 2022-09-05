import React from "react";
import jwt from "jwt-simple";
import { format } from "../../utils/dates";
import { Badge, Box, Chip, Tooltip, Typography } from "@material-ui/core";
import { MessageSource } from "../../constants";
import RowActions from "@tecsinapse/table/build/Table/Rows/RowActions/RowActions";
import { oldEncodeChatData } from "../../utils/oldEncodeChatData";
import { MESSAGES_INFO } from "../../constants/MessagesInfo";
import Icon from "@mdi/react";
import { mdiInformation } from "@mdi/js";

export const generateActions = (
  row,
  userkeycloakId,
  handleSelectCurrentChat,
  handleSelectChat
) => {
  const actions = [
    {
      label: "Visualizar Mensagens",
      onClick: (rowData) => {
        handleSelectCurrentChat(rowData);
      },
    },
  ];

  if (row.actions && row.actions.length > 0) {
    row.actions.forEach((actionLink) => {
      actions.push({
        label: actionLink.label,
        onClick: (rowData) => {
          const encodedData = oldEncodeChatData(rowData, userkeycloakId);

          window.open(`${actionLink.path}?data=${encodedData}`, "_self");
        },
      });
    });
  }

  if (!row.archived) {
    actions.push({
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "4px" }}>
            {MESSAGES_INFO.DISCARD_LABEL}
          </span>
          <Tooltip title={MESSAGES_INFO.DISCARD_TOOLTIP_TEXT}>
            <Icon path={mdiInformation} size={0.8} />
          </Tooltip>
        </div>
      ),
      onClick: (rowData) => {
        handleSelectChat(rowData);
      },
    });
  }

  return actions;
};

export const generateColumns = (
  classes,
  extraInfoColumns,
  userkeycloakId,
  handleSelectCurrentChat,
  handleSelectChat,
  globalSearch
) => {
  const columns = [
    {
      title: "Data do Contato",
      field: "contactAt",
      customRender: ({ archived, contactAt }) => (
        <>
          {archived ? (
            <span>
              {highlight(globalSearch, format(contactAt))}
              <br />
              <Chip size="small" label={"Arquivada"} />
            </span>
          ) : (
            <span>{highlight(globalSearch, format(contactAt))}</span>
          )}
        </>
      ),
    },
    {
      title: "Cliente",
      field: "name",
      customRender: ({
        name,
        phone,
        lastMessage,
        lastMessageSource,
        extraInfos,
        highlighted,
      }) => {
        const lastSender = MessageSource.isClient(lastMessageSource)
          ? name?.split(" ")[0]
          : extraInfos?.responsavel?.split(" ")[0];

        return (
          <div style={{ minWidth: "400px", maxWidth: "520px" }}>
            <Typography variant="caption">
              {highlight(globalSearch, phone)}
            </Typography>
            <br />
            {highlighted ? (
              <span style={{ color: "#e6433f" }}>
                <b>{highlight(globalSearch, name)}</b>
              </span>
            ) : (
              <span>{highlight(globalSearch, name)}</span>
            )}
            <br />
            <Typography variant="caption">
              <i>
                {Boolean(lastSender)
                  ? lastSender + ": " + lastMessage
                  : lastMessage}
              </i>
            </Typography>
          </div>
        );
      },
    },
  ];

  if (extraInfoColumns && Object.keys(extraInfoColumns).length > 0) {
    columns.push({
      title: "Informações Extras",
      field: `extraInfos`,
      customRender: ({ extraInfos }) => (
        <Box display="grid">
          {Object.keys(extraInfoColumns).map((key) => (
            <Typography key={key} variant="caption">
              <b>{extraInfoColumns[key]}: </b>
              {extraInfos[key]
                ? highlight(globalSearch, extraInfos[key])
                : "Indefinido"}
            </Typography>
          ))}
        </Box>
      ),
    });
  }

  columns.push({
    title: "Ações",
    field: "",
    customRender: (row) => {
      const { unreads } = row;

      return (
        <Badge
          color="error"
          badgeContent={unreads}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          classes={{
            anchorOriginTopRightRectangle: classes.badgeAlign,
          }}
        >
          <RowActions
            actions={generateActions(
              row,
              userkeycloakId,
              handleSelectCurrentChat,
              handleSelectChat
            )}
            row={row}
            verticalActions
            forceCollapseActions
          />
        </Badge>
      );
    },
  });

  return columns;
};

export const encodeChatData = (chat, userkeycloakId) => {
  return jwt.encode({ data: JSON.stringify(chat) }, userkeycloakId, "HS256");
};

export const normalize = (value) => {
  if (value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  } else {
    return "";
  }
};

export const split = (value, indexes, size) => {
  let currentIndex = 0;

  const result = [];

  indexes.forEach((index) => {
    result.push(value.substring(currentIndex, index));
    result.push(value.substring(index, index + size));
    currentIndex = index + size;
  });

  result.push(value.substring(currentIndex, value.length));

  return result.filter((e) => e);
};

export const replacer = (search, textToReplace) => {
  const normalizedSearch = normalize(search);
  const normalizedTextToReplace = normalize(textToReplace);
  const regex = new RegExp(`(${normalizedSearch})`, "g");
  const matchs = Array.from(normalizedTextToReplace.matchAll(regex));

  if (matchs.length <= 0) {
    return textToReplace;
  }

  const indexes = matchs.map((match) => match.index);
  const splited = split(textToReplace, indexes, search.length);

  return splited.map((m, idx) =>
    normalize(m) === normalizedSearch ? (
      <span
        key={`highlight-${m}${idx}`}
        id={`highlight-${m}`}
        style={{ backgroundColor: "#ffb74d" }}
      >
        {m}
      </span>
    ) : (
      <>{m}</>
    )
  );
};

export const highlight = (search, textToReplace) => {
  if (textToReplace && search) {
    return replacer(search, textToReplace);
  }
  return textToReplace;
};

const truncate = (value, limit) => {
  if (!value || value.length <= limit) {
    return value;
  }
  return value.slice(0, limit) + "...";
};
