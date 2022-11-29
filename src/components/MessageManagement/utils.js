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
  handleSelectChat,
  executeFirstAction
) => {
  const actions = [];

  if (!executeFirstAction) {
    actions.push({
      label: "Visualizar Mensagens",
      onClick: (rowData) => {
        handleSelectCurrentChat(rowData);
      },
    });
  }

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

  const style1 = { display: "flex", alignItems: "center" };
  const style2 = { marginRight: "4px" };

  if (!row.archived) {
    actions.push({
      label: (
        <div style={style1}>
          <span style={style2}>Arquivar Conversa</span>
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
  globalSearch,
  executeFirstAction
) => {
  const columns = [
    {
      title: "Data do Contato",
      field: "contactAt",
      customRender: ({ archived, contactAt }) => (
        <>
          {archived ? (
            <span>
              {formatDateTime(contactAt)}
              <br />
              <Chip size="small" label="Arquivada" />
            </span>
          ) : (
            <span>{formatDateTime(contactAt)}</span>
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

        const style1 = { minWidth: "400px", maxWidth: "520px" };
        const style2 = { color: "#e6433f" };

        return (
          <div style={style1}>
            <Typography variant="caption">
              {highlightPhone(globalSearch, phone)}
            </Typography>
            <br />
            {highlighted ? (
              <span style={style2}>
                <b>{highlight(globalSearch, name)}</b>
              </span>
            ) : (
              <span>{highlight(globalSearch, name)}</span>
            )}
            <br />
            {lastMessage && (
              <Typography variant="caption">
                <i>{`${lastSender}: ${lastMessage}`}</i>
              </Typography>
            )}
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
              handleSelectChat,
              executeFirstAction
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

  // eslint-disable-next-line react/no-array-index-key
  const indexes = matchs.map((match) => match.index);
  const splited = split(textToReplace, indexes, search.length);
  const style1 = { backgroundColor: "#ffb74d" };

  return splited.map((text, index) =>
    normalize(text) === normalizedSearch ? (
      <span
        // eslint-disable-next-line react/no-array-index-key
        key={`highlight-${text}${index}`}
        id={`highlight-${text}`}
        style={style1}
      >
        {text}
      </span>
    ) : (
      <>{text}</>
    )
  );
};

export const highlight = (search, textToReplace) => {
  if (textToReplace && search) {
    return replacer(search, textToReplace);
  }

  return textToReplace;
};

export const highlightPhone = (search, textToReplace) => {
  if (textToReplace && search) {
    return replacerPhone(search, textToReplace);
  }

  return textToReplace;
};

export const replacerPhone = (search, phoneToReplace) => {
  const normalizedSearch = normalize(search).replace(/\s+/g, "");
  const normalizedPhoneToReplace = normalize(phoneToReplace).replace(/\D/g, "");

  const phoneWithoutDDD = normalizedPhoneToReplace.substring(
    2,
    normalizedPhoneToReplace.length
  );
  const phoneDDD = normalizedPhoneToReplace.substring(0, 2);
  const indexMatchDDD = normalizedPhoneToReplace.indexOf(normalizedSearch);

  return (
    <>
      {highlightDDD(
        normalizedSearch,
        normalizedPhoneToReplace,
        phoneDDD,
        indexMatchDDD
      )}
      {highlightPhoneWithoutDDD(
        normalizedSearch.substring(2 - indexMatchDDD, normalizedSearch.length),
        phoneWithoutDDD,
        phoneToReplace,
        indexMatchDDD
      )}
    </>
  );
};

export const highlightDDD = (search, phone, phoneDDD, index) => {
  if (index === 0) {
    return <>({applyHighlight(phoneDDD)})</>;
  }

  if (index === 1) {
    return (
      <>
        ({phoneDDD.substring(0, 1)}
        {applyHighlight(search.substring(0, 1))})
      </>
    );
  }

  return `(${phoneDDD})`;
};

export const highlightPhoneWithoutDDD = (
  search,
  phoneWithoutDDD,
  phoneToReplace
  // eslint-disable-next-line consistent-return
) => {
  const index = phoneWithoutDDD.indexOf(search);
  const firstHalfLength = Math.round(phoneWithoutDDD.length / 2);

  if (phoneWithoutDDD.match(search) && search !== "") {
    if (index <= 4) {
      if (index + search.length > firstHalfLength) {
        return (
          <>
            {phoneWithoutDDD.substring(0, index)}
            {applyHighlight(search.substring(0, firstHalfLength - index))}-
            {applyHighlight(
              search.substring(firstHalfLength - index, search.length)
            )}
            {phoneWithoutDDD.substring(
              index + search.length,
              phoneWithoutDDD.length
            )}
          </>
        );
      }

      return (
        <>
          {phoneWithoutDDD.substring(0, index)}
          {applyHighlight(search)}
          {phoneWithoutDDD.substring(index + search.length, firstHalfLength)}-
          {phoneWithoutDDD.substring(firstHalfLength, phoneWithoutDDD.length)}
        </>
      );
    }

    if (phoneWithoutDDD.indexOf(search) > 4) {
      return (
        <>
          {phoneWithoutDDD.substring(0, firstHalfLength)}-
          {phoneWithoutDDD.substring(firstHalfLength, index)}
          {applyHighlight(search)}
          {phoneWithoutDDD.substring(index + search.length)}
        </>
      );
    }
  } else {
    return <>{phoneToReplace.substring(4, phoneToReplace.length)}</>;
  }
};

export const applyHighlight = (text) => {
  const style1 = { backgroundColor: "#ffb74d" };

  return (
    <span key={`highlight-${text}`} id={`highlight-${text}`} style={style1}>
      {text}
    </span>
  );
};
