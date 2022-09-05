import React, { useEffect, useState } from "react";
import { Divider as MuiDivider, Drawer } from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";

import ReactGA from "react-ga4";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
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
} from "../utils";
import { getDistinctConnectionKeys } from "./utils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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

  return (
    <QueryClientProvider client={queryClient}>
      <InitContext {...props} />
    </QueryClientProvider>
  );
};

const InitContext = ({ chatInitConfig, token }) => {
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

  const [view, setView] = useState(COMPONENT_LOCATION.MESSAGE_MANAGEMENT);
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
    if (reload) {
      loadComponentInfo().then(() => {
        setReload(false);
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSetView = (view) => {
    ReactGA.event({
      category: COMPONENT_LOCATION[view],
      action: "Navigate",
    });

    setView((oldView) => {
      if (oldView === COMPONENT_LOCATION.CHAT_MESSAGES) {
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
    if (webSocketMessage && webSocketMessage.message) {
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

    if (!archived && newCurrentChat.unreads > 0) {
      const currentChatId = getChatId(currentChat);

      const index = componentInfo.chatIds.findIndex(
        (it) => getChatId(it) === currentChatId
      );

      componentInfo.chatIds[index].unreads = 0;
      newCurrentChat.unreads = 0;
    }

    setBlocked(blocked);
    setCurrentChatSend(blocked ? newCurrentChat : null);
    setCurrentChat(newCurrentChat);
  };

  const handleStartSendNotification = () => {
    if (COMPONENT_LOCATION.CHAT_MESSAGES !== view) {
      setCurrentChatSend(null);
    }
    setView(COMPONENT_LOCATION.SEND_NOTIFICATION);
  };

  // propaga a alteração do som da notificação para todos os componentes abertos
  window.onstorage = handleLocalStorage(userkeycloakId, setNotificationSound);

  return (
    <>
      <div className="Chat">
        {!openDrawer && (
          <ChatButton
            firstLoad={firstLoad}
            setOpenDrawer={setOpenDrawer}
            unreads={componentInfo?.totalUnreads}
          />
        )}
        <Drawer anchor="right" open={openDrawer} onClose={handleCloseDrawer}>
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
            {view === COMPONENT_LOCATION.CHAT_MESSAGES && (
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
            {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
              <MessageManagement
                loading={loading}
                setLoading={setLoading}
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
                setView={handleSetView}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                productService={productService}
                chatService={chatService}
              />
            )}
            {view === COMPONENT_LOCATION.SEND_NOTIFICATION && (
              <SendNotification
                chat={currentChatSend}
                userPhoneNumber={chatInitConfig.userPhoneNumber || ""}
                chatApiUrl={chatInitConfig.chatApiUrl}
                connectionKeys={componentInfo.connectionKeys}
                destination={componentInfo.destination}
                createPath={chatInitConfig.createPath}
                productService={productService}
                chatService={chatService}
                info={componentInfo.sendNotificationInfo}
                extraFields={componentInfo.extraFields}
                reloadComponent={() => console.log("reloadComponent")}
                setChat={setCurrentChat}
                setView={setView}
                token={token}
                userId={userkeycloakId}
              />
            )}
            {canSendNotification &&
              (view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT ||
                (view === COMPONENT_LOCATION.CHAT_MESSAGES &&
                  currentChat?.blocked)) && (
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
    </>
  );
};
