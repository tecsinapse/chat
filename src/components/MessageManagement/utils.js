import React from "react";
import { Badge, Box, Chip, Tooltip, Typography } from "@material-ui/core";
import RowActions from "@tecsinapse/table/build/Table/Rows/RowActions/RowActions";
import Icon from "@mdi/react";
import { mdiInformation } from "@mdi/js";
import { encodeChatData, formatDateTime, normalize } from "../utils";
import MessageSource from "../../enums/MessageSource";

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
          const encodedData = encodeChatData(rowData, userkeycloakId);

          window.open(`${actionLink.path}?data=${encodedData}`, "_self");
        },
      });
    });
  }

  if (!row.archived) {
    actions.push({
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "4px" }}>Arquivar Conversa</span>
          <Tooltip title="O recurso arquivar conversa possibilita ocultar uma conversa para organizar melhor sua lista de conversas. As mensagens não são excluídas, sendo possível retomar o diálogo iniciando uma nova conversa de forma ativa ou aguardando um novo contato do cliente.">
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
  userNamesById,
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
              {highlight(globalSearch, formatDateTime(contactAt))}
              <br />
              <Chip size="small" label={"Arquivada"} />
            </span>
          ) : (
            <span>{highlight(globalSearch, formatDateTime(contactAt))}</span>
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
        lastMessageUserId,
        highlighted,
      }) => {
        let lastSender = "Wingo";

        if (MessageSource.isClient(lastMessageSource)) {
          lastSender = name?.split(" ")[0];
        } else if (
          MessageSource.isProduct(lastMessageSource) &&
          lastMessageUserId
        ) {
          if (userNamesById[lastMessageUserId]) {
            lastSender = userNamesById[lastMessageUserId]?.split(" ")[0];
          }
        }

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
              <i>{lastSender + ": " + lastMessage}</i>
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
