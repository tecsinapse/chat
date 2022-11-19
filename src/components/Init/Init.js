import React, { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import { Divider as MuiDivider, Drawer } from "@material-ui/core";
import { Button } from "@tecsinapse/ui-kit";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";
import { RenderChat } from "../RenderChat/RenderChat";
import { InitWebSockets } from "../InitWebSockets/InitWebSockets";
import { MessageManagement } from "../MessageManagement/MessageManagement";
import { ChatButton } from "../ChatButton/ChatButton";
import { SendNotification } from "../SendNotification/SendNotification";
import { useStyle } from "./styles";
import { StartNewChatButton } from "../StartNewChatButton/StartNewChatButton";
import { HeaderDrawer } from "../HeaderDrawer/HeaderDrawer";
import { ProductService } from "../../service/ProductService";
import { ChatService } from "../../service/ChatService";
import {
  getChatId,
  handleLocalStorage,
  isNotificationSoundEnabled,
  sendNotification,
} from "../utils";
import NotificationType from "../../enums/NotificationType";
import { ConnectionError } from "../ConnectionError/ConnectionError";
import { Banner } from "../Banner/Banner";
import { RESOURCES } from "../../constants/RESOURCES";

export const Init = (props) => {
  React.useLayoutEffect(() => {
    ReactGA.initialize(process.env.REACT_APP_GA_ID, {
      gaOptions: {
        chatVersion: process.env.REACT_APP_VERSION,
        keycloakUser: props?.chatInitConfig?.userkeycloakId,
      },
    });
  }, [props]);

  React.useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/init" });
  }, [props]);

  return <InitContext {...props} />;
};

const InitContext = ({ chatInitConfig }) => {
  const {
    userkeycloakId,
    chatApiUrl,
    productChatPath,
    openImmediately,
    canSendNotification,
    executeFirstAction,
    showBackButton,
    showMessageManagementBanner,
    params,
  } = chatInitConfig;

  const productService = new ProductService(productChatPath);
  const chatService = new ChatService(chatApiUrl);

  const [view, setView] = useState(COMPONENT_VIEW.COMPONENT_INIT);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [componentInfo, setComponentInfo] = useState({});
  const [reload, setReload] = useState(false);

  const [onlyNotClients, setOnlyNotClients] = useState(false);
  const [onlyUnreads, setOnlyUnreads] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10); // eslint-disable-line no-unused-vars

  const [currentChatSend, setCurrentChatSend] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  const [destination, setDestination] = useState(null);
  const [webSocketRef, setWebSocketRef] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  const [receivedMessage, setReceivedMessage] = useState();

  const [openDrawer, setOpenDrawer] = useState(false);

  const [notificationSound, setNotificationSound] = useState(
    isNotificationSoundEnabled(userkeycloakId)
  );

  const classes = useStyle(view)();

  const loadComponentInfo = async () => {
    setLoading(true);

    productService
      .loadComponentInfo(
        globalSearch,
        onlyNotClients,
        onlyUnreads,
        componentInfo?.chatIds,
        params,
        page,
        pageSize
      )
      .then((incompleteChatInfo) => {
        chatService
          .completeComponentInfo(incompleteChatInfo)
          .then((completeComponentInfo) => {
            const {
              destination: newDestination,
              currentChat: newCurrentChat,
            } = completeComponentInfo;

            setDestination(newDestination);
            setComponentInfo(completeComponentInfo);

            // caso tenha um chat corrente após primeiro carregamento
            // abre a tela de mensagens ou envio de notificação
            if (!firstLoad && !openDrawer && newCurrentChat) {
              if (!newCurrentChat.chatId) {
                setCurrentChatSend(newCurrentChat);
                handleSetView(COMPONENT_VIEW.SEND_NOTIFICATION);
              } else {
                setCurrentChat(newCurrentChat);
                handleSetView(COMPONENT_VIEW.CHAT_MESSAGES);
              }
              setOpenDrawer(true);
            }

            setFirstLoad(false);
            setLoading(false);
          })
          .catch(() => {
            setConnectionError(true);
            setLoading(false);
          });
      })
      .catch(() => {
        setConnectionError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadComponentInfo().then(() => {
      // do nothing
    });
  }, [onlyNotClients, onlyUnreads, page, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // quando é setado um novo valor para o globalSearch
  // deve retornar para a primeira página ou recarregar
  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    } else {
      setReload(true);
    }
  }, [globalSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // não executa o reload caso tenha carregamento pendente
    if (reload && !loading) {
      loadComponentInfo().then(() => {
        setReload(false);
      });
    } else if (reload) {
      setReload(false);
    }
  }, [reload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (connectionError) {
      handleSetView(COMPONENT_VIEW.CONNECTION_ERROR);
    } else if (view === COMPONENT_VIEW.CONNECTION_ERROR) {
      handleSetView(COMPONENT_VIEW.MESSAGE_MANAGEMENT);
    }
  }, [connectionError]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const { currentChat: newCurrentChat } = componentInfo;

    if (webSocketRef && newCurrentChat && newCurrentChat.chatId) {
      setCurrentChat(newCurrentChat);
      handleSetView(COMPONENT_VIEW.CHAT_MESSAGES);
    }

    if (webSocketRef && openImmediately) {
      setOpenDrawer(true);
    }
  }, [webSocketRef]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => {
      window.addEventListener("message", (event) => {
        try {
          const json = JSON.parse(event.data);

          if (json && json.tipo === "TEC-INIT-WINGO-CHAT") {
            // eslint-disable-next-line no-param-reassign
            chatInitConfig.params.clienteId = json.clienteId;

            // eslint-disable-next-line no-param-reassign
            chatInitConfig.params.phoneNumber = json.phoneNumber;

            setReload(true);
          }
        } catch (e) {
          // nothing
        }
      });
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (showMessageManagementBanner) {
      const script = document.createElement("script");
      const element = document.getElementById("wingo-chat-component");

      script.src = RESOURCES.TALLY_EMBED_SCRIPT_SRC;
      script.async = true;

      element.append(script);
    }
  }, [showMessageManagementBanner]);

  const handleSetView = (newView) => {
    ReactGA.event({
      category: COMPONENT_VIEW[newView],
      action: "Navigate",
    });

    setView((oldView) => {
      if (oldView === COMPONENT_VIEW.CHAT_MESSAGES && !connectionError) {
        setCurrentChat(null);
        setReload(true);
      }

      return newView;
    });
  };

  const handleWebSocketConnect = (newWebSocketRef) => {
    setWebSocketRef(newWebSocketRef);
    setConnectionError(false);
  };

  const handleWebSocketDisconnect = () => {
    setConnectionError(true);
  };

  const handleWebSocketMessage = (webSocketMessage) => {
    if (webSocketMessage && webSocketMessage.type) {
      const { chatId, title, message, type } = webSocketMessage;

      const chatActive = currentChat?.chatId === chatId;

      // não notifica quando o chat está aberto por algum usuário
      // não notifica arquivamento de conversas
      if (!chatActive && !NotificationType.isArchivedChat(type)) {
        sendNotification(userkeycloakId, title, message);
      }

      setReload(true);
    } else if (webSocketMessage && webSocketMessage.message) {
      setReceivedMessage(webSocketMessage);
    }
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const handleAfterLoadMessage = (archived, blocked, minutesToBlock) => {
    const newCurrentChat = {
      ...currentChat,
      minutesToBlock,
      blocked,
    };

    // só atualiza as mensagens não lidas caso o chat não esteja arquivado
    if (!archived && newCurrentChat.unreads > 0) {
      const currentChatId = getChatId(currentChat);

      const index = componentInfo.chatIds.findIndex(
        (it) => getChatId(it) === currentChatId
      );

      if (index > -1) {
        const newComponentInfo = { ...componentInfo };
        const { totalUnreads } = newComponentInfo;
        const chatUnreads = newComponentInfo.chatIds[index].unreads;

        newComponentInfo.totalUnreads = totalUnreads - chatUnreads;
        newComponentInfo.chatIds[index].unreads = 0;
        setComponentInfo(newComponentInfo);
      }

      newCurrentChat.unreads = 0;
    }

    setCurrentChatSend(blocked ? newCurrentChat : null);
    setCurrentChat(newCurrentChat);
  };

  const handleStartSendNotification = () => {
    handleSetView(COMPONENT_VIEW.SEND_NOTIFICATION);
  };

  // propaga a alteração do som da notificação para todos os componentes abertos
  window.onstorage = handleLocalStorage(userkeycloakId, setNotificationSound);

  return (
    <div>
      {process.env.REACT_APP_HOST === "development" && (
        <Button
          variant="contained"
          onClick={() => {
            window.postMessage(
              JSON.stringify({
                clienteId: 59996,
                phoneNumber: "(67)98125-5445",
                tipo: "TEC-INIT-WINGO-CHAT",
              })
            );
          }}
        >
          Teste Init Wingo Chat
        </Button>
      )}
      {!openDrawer && (
        <ChatButton
          userkeycloakId={userkeycloakId}
          firstLoad={firstLoad}
          setOpenDrawer={setOpenDrawer}
          view={view}
          setView={handleSetView}
          unreads={componentInfo?.totalUnreads}
          chatService={chatService}
        />
      )}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        ModalProps={{
          container: document.getElementById("wingo-chat-component"),
        }}
      >
        <div className={classes.drawerContainer}>
          <HeaderDrawer
            userkeycloakId={userkeycloakId}
            setOpenDrawer={setOpenDrawer}
            setCurrentChatSend={setCurrentChatSend}
            notificationSound={notificationSound}
            setNotificationSound={setNotificationSound}
            view={view}
            setView={handleSetView}
            showBackButton={showBackButton}
          />
          {view === COMPONENT_VIEW.MESSAGE_MANAGEMENT &&
            showMessageManagementBanner && (
              <Banner
                imgUrl={RESOURCES.MESSAGE_MANAGEMENT_BANNER}
                formUrl="https://tally.so#tally-open=nPdKk0&tally-width=667&tally-hide-title=1&tally-overlay=1&tally-emoji-text=👋&tally-emoji-animation=wave"
                formParams={{
                  kcid: userkeycloakId,
                }}
              />
            )}
          <MuiDivider variant="fullWidth" />
          {view === COMPONENT_VIEW.CONNECTION_ERROR && <ConnectionError />}
          {view === COMPONENT_VIEW.CHAT_MESSAGES && (
            <RenderChat
              chatService={chatService}
              userkeycloakId={userkeycloakId}
              currentChat={currentChat}
              setCurrentChat={setCurrentChat}
              setCurrentChatSend={setCurrentChatSend}
              setReload={setReload}
              setDrawerOpen={setOpenDrawer}
              handleAfterLoadMessage={handleAfterLoadMessage}
              receivedMessage={receivedMessage}
              userNamesById={componentInfo?.userNamesById}
              webSocketRef={webSocketRef}
              canSendNotification={canSendNotification}
              productService={productService}
              view={view}
              setView={handleSetView}
            />
          )}
          {view === COMPONENT_VIEW.MESSAGE_MANAGEMENT && (
            <MessageManagement
              loading={loading}
              onlyNotClients={onlyNotClients}
              setOnlyNotClients={setOnlyNotClients}
              onlyUnreads={onlyUnreads}
              setOnlyUnreads={setOnlyUnreads}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              setCurrentChat={setCurrentChat}
              setConnectionError={setConnectionError}
              componentInfo={componentInfo}
              userkeycloakId={userkeycloakId}
              userNamesById={componentInfo?.userNamesById}
              view={view}
              setView={handleSetView}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              executeFirstAction={executeFirstAction}
              productService={productService}
              chatService={chatService}
            />
          )}
          {view === COMPONENT_VIEW.SEND_NOTIFICATION && (
            <SendNotification
              chatService={chatService}
              productService={productService}
              userkeycloakId={userkeycloakId}
              connectionKeys={componentInfo?.connectionKeys}
              currentChat={currentChatSend}
              setCurrentChat={setCurrentChat}
              loading={loading}
              setLoading={setLoading}
              setConnectionError={setConnectionError}
              view={view}
              setView={handleSetView}
              userNamesById={componentInfo?.userNamesById}
            />
          )}
          {canSendNotification &&
            (view === COMPONENT_VIEW.MESSAGE_MANAGEMENT ||
              (view === COMPONENT_VIEW.CHAT_MESSAGES &&
                currentChat?.blocked)) && (
              <StartNewChatButton
                handleStartSendNotification={handleStartSendNotification}
              />
            )}
        </div>
      </Drawer>
      {!firstLoad && (
        <InitWebSockets
          chatApiUrl={chatApiUrl}
          userkeycloakId={userkeycloakId}
          destination={destination}
          currentChat={currentChat}
          handleConnect={handleWebSocketConnect}
          handleDisconnect={handleWebSocketDisconnect}
          handleMessage={handleWebSocketMessage}
        />
      )}
    </div>
  );
};
