import React, { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import { Divider as MuiDivider, Drawer } from "@material-ui/core";
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
import { messageEventListener } from "../../utils/helpers";
import {
  getChatId,
  handleLocalStorage,
  isNotificationSoundEnabled,
  sendNotification,
} from "../utils";
import { getDistinctConnectionKeys } from "./utils";
import NotificationType from "../../enums/NotificationType";

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
    chatUrl,
    chatApiUrl,
    productChatPath,
    openImmediately,
    pageSize,
    canSendNotification,
  } = chatInitConfig;

  const productService = new ProductService(productChatPath);
  const chatService = new ChatService(chatApiUrl);

  const [view, setView] = useState(COMPONENT_VIEW.MESSAGE_MANAGEMENT);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [componentInfo, setComponentInfo] = useState({});
  const [reload, setReload] = useState(false);

  const [onlyNotClients, setOnlyNotClients] = useState(false);
  const [onlyUnreads, setOnlyUnreads] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [page, setPage] = useState(0);

  const [selectedChat, setSelectedChat] = useState(null);
  const [currentChatSend, setCurrentChatSend] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  const [connectionKeys, setConnectionKeys] = useState([]);
  const [destination, setDestination] = useState(null);
  const [webSocketRef, setWebSocketRef] = useState(null);

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
        page,
        pageSize
      )
      .then((componentInfo) => {
        chatService
          .completeComponentInfo(componentInfo)
          .then((completeComponentInfo) => {
            const { connectionKeys, destination } = completeComponentInfo;
            setDestination(destination);
            setConnectionKeys(getDistinctConnectionKeys(connectionKeys));
            setComponentInfo(completeComponentInfo);
            setFirstLoad(false);
            setLoading(false);
          });
      });
  };

  useEffect(() => {
    loadComponentInfo().then(() => {
      if (openImmediately) {
        setOpenDrawer(true);
      }
    });
  }, [globalSearch, onlyNotClients, onlyUnreads, page]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(
    () =>
      window.addEventListener("message", async (event) => {
        await messageEventListener(
          event,
          //propsToLoadComponent,
          setCurrentChatSend,
          setView,
          setOpenDrawer
        );
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSetView = (view) => {
    ReactGA.event({
      category: COMPONENT_VIEW[view],
      action: "Navigate",
    });

    setView((oldView) => {
      if (oldView === COMPONENT_VIEW.CHAT_MESSAGES) {
        setReload(true);
      }
      return view;
    });
  };

  const handleWebSocketConnect = (webSocketRef) => {
    const mainSocket = webSocketRef.current;

    connectionKeys.forEach((connectionKey) => {
      const addUser = `/chat/addUser/main/${connectionKey}/${destination}`;
      mainSocket.sendMessage(addUser, userkeycloakId);
    });

    setWebSocketRef(webSocketRef);
  };

  const handleWebSocketMessage = (webSocketMessage) => {
    if (webSocketMessage && webSocketMessage.type) {
      const { title, message, chatActive, type } = webSocketMessage;

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

  const handleAfterLoadMessage = (
    archived,
    blocked,
    minutesToBlock,
    setBlocked
  ) => {
    const newCurrentChat = {
      ...currentChat,
      minutesToBlock: minutesToBlock,
      blocked: blocked,
    };

    // só atualiza as mensagens não lidas caso o chat não esteja arquivado
    if (!archived && newCurrentChat.unreads > 0) {
      const currentChatId = getChatId(currentChat);

      const index = componentInfo.chatIds.findIndex(
        (it) => getChatId(it) === currentChatId
      );

      if (index > -1) {
        const newComponentInfo = { ...componentInfo };
        const totalUnreads = newComponentInfo.totalUnreads;
        const chatUnreads = newComponentInfo.chatIds[index].unreads;
        newComponentInfo.totalUnreads = totalUnreads - chatUnreads;
        newComponentInfo.chatIds[index].unreads = 0;
        setComponentInfo(newComponentInfo);
      }

      newCurrentChat.unreads = 0;
    }

    setBlocked(blocked);
    setCurrentChatSend(blocked ? newCurrentChat : null);
    setCurrentChat(newCurrentChat);
  };

  const handleStartSendNotification = () => {
    if (COMPONENT_VIEW.CHAT_MESSAGES !== view) {
      setCurrentChatSend(null);
    }
    setView(COMPONENT_VIEW.SEND_NOTIFICATION);
  };

  // propaga a alteração do som da notificação para todos os componentes abertos
  window.onstorage = handleLocalStorage(userkeycloakId, setNotificationSound);

  return (
    <div>
      {!openDrawer && (
        <ChatButton
          firstLoad={firstLoad}
          setOpenDrawer={setOpenDrawer}
          unreads={componentInfo?.totalUnreads}
        />
      )}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
        ModalProps={{
          container: document.getElementById("wingo-chat"),
        }}
      >
        <div className={classes.drawerContainer}>
          <HeaderDrawer
            userkeycloakId={userkeycloakId}
            setOpenDrawer={setOpenDrawer}
            notificationSound={notificationSound}
            setNotificationSound={setNotificationSound}
            view={view}
            setView={handleSetView}
          />
          <MuiDivider variant="fullWidth" />
          {view === COMPONENT_VIEW.CHAT_MESSAGES && (
            <RenderChat
              chatService={chatService}
              userkeycloakId={userkeycloakId}
              currentChat={currentChat}
              setCurrentChat={setCurrentChat}
              setReload={setReload}
              setDrawerOpen={setOpenDrawer}
              handleAfterLoadMessage={handleAfterLoadMessage}
              receivedMessage={receivedMessage}
              userNamesById={componentInfo?.userNameById}
              webSocketRef={webSocketRef}
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
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              setCurrentChat={setCurrentChat}
              componentInfo={componentInfo}
              userkeycloakId={userkeycloakId}
              userNamesById={componentInfo?.userNameById}
              setView={handleSetView}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
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
              setView={handleSetView}
              userNamesById={componentInfo?.userNameById}
            />
          )}
          {canSendNotification &&
            (view === COMPONENT_VIEW.MESSAGE_MANAGEMENT ||
              (view === COMPONENT_VIEW.CHAT_MESSAGES && currentChat?.blocked)) && (
              <StartNewChatButton
                handleStartSendNotification={handleStartSendNotification}
              />
            )}
        </div>
      </Drawer>
      {!firstLoad && (
        <InitWebSockets
          chatUrl={chatUrl}
          userkeycloakId={userkeycloakId}
          destination={destination}
          handleConnect={handleWebSocketConnect}
          handleMessage={handleWebSocketMessage}
        />
      )}
    </div>
  );
};
