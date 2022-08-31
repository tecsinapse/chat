import React, { useEffect, useState } from "react";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useTheme } from "@material-ui/styles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider as MuiDivider,
  Drawer,
} from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";

import ReactGA from "react-ga4";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { RenderChat } from "../RenderChat/RenderChat";
import { InitWebSockets } from "../InitWebSockets/InitWebSockets";
import { MessageManagement } from "../MessageManagement/MessageManagement";
import { ChatButton } from "../ChatButton/ChatButton";
import { oldEncodeChatData } from "../../utils/oldEncodeChatData";
import { SendNotification } from "../SendNotification/SendNotification";
import { useStyle } from "./styles";
import { StartNewChatButton } from "../StartNewChatButton/StartNewChatButton";

import {
  isChatViewAndIsBlocked,
  isShowBackButton,
  isShowMessageManagement,
  isShowSendNotification,
  onChatStatusChanged,
  onReadAllMessagesOfChat,
  onStartSendNotification,
} from "./functions";
import { HeaderDrawer } from "../HeaderDrawer/HeaderDrawer";
import { ProductService } from "../../service/ProductService";
import { ChatService } from "../../service/ChatService";
import { messageEventListener } from "../../utils/helpers";
import { loadComponentInfo } from "./utils";
import { MessageManagementLink } from "../MessageManagementLink/MessageManagementLink";
import { handleLocalStorage, isNotificationSoundEnabled } from "../utils";

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

  console.log(props);

  return (
    <QueryClientProvider client={queryClient}>
      <InitContext {...props} />
    </QueryClientProvider>
  );
};

const InitContext = ({
  chatInitConfig,
  customizeStyles,
  customActions,
  mobile = false,
  userMock,
  token,
}) => {
  const {
    userkeycloakId,
    chatUrl,
    chatApiUrl,
    productChatPath,
    openImmediately,
    pageSize,
  } = chatInitConfig;

  const productService = new ProductService(productChatPath);
  const chatService = new ChatService(chatApiUrl);

  const [view, setView] = useState(COMPONENT_LOCATION.MESSAGE_MANAGEMENT);
  const [chatToOpenFirstAction, setChatToOpenFirstAction] = useState({});
  const [chatToSendNotification, setChatToSendNotification] = useState();
  const [receivedMessage, setReceivedMessage] = useState();
  const [unreadTotal, setUnreadTotal] = useState(0);

  //----------------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [componentInfo, setComponentInfo] = useState({});

  const [onlyNotClients, setOnlyNotClients] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [page, setPage] = useState(0);

  const [selectedChat, setSelectedChat] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  const [connectionKeys, setConnectionKeys] = useState([]);
  const [destination, setDestination] = useState(null);
  const [webSocketRef, setWebSocketRef] = useState(null);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [notificationSound, setNotificationSound] = useState(
    isNotificationSoundEnabled(userkeycloakId)
  );

  const classes = useStyle(view)();
  const theme = useTheme();

  useEffect(() => {
    loadComponentInfo({
      chatService,
      productService,
      globalSearch,
      onlyNotClients,
      setLoading,
      setConnectionKeys,
      setDestination,
      setComponentInfo,
      setFirstLoad,
      page,
      pageSize,
    }).then(() => {
      if (openImmediately) {
        setOpenDrawer(true);
      }
    });
  }, [globalSearch, onlyNotClients, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadComponent = () => {
    console.log("reloadComponent");
  };

  useEffect(
    () =>
      window.addEventListener("message", async (event) => {
        await messageEventListener(
          event,
          //propsToLoadComponent,
          setChatToSendNotification,
          setView,
          setOpenDrawer
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onSelectUnreadChat = (chat) => {
    if (chatInitConfig.clickOnUnreadOpenFirstAction) {
      setChatToOpenFirstAction(chat);
    } else {
      //handleSelectChat(chat);
    }
  };

  let showBackButton = isShowBackButton(view, chatInitConfig);
  let showMessageManagement = isShowMessageManagement(view);

  if (
    view === COMPONENT_LOCATION.CHAT_MESSAGES &&
    !chatInitConfig.navigateWhenCurrentChat
  ) {
    showBackButton = false;
    showMessageManagement = false;
  }

  const chatViewAndIsBlocked = isChatViewAndIsBlocked(
    view,
    chatToSendNotification
  );

  const showSendNotification = isShowSendNotification(
    view,
    chatInitConfig,
    chatViewAndIsBlocked
  );

  window.onstorage = handleLocalStorage(userkeycloakId, setNotificationSound);

  const closeIconStyles = { cursor: "pointer" };

  const handleSetView = (view) => {
    ReactGA.event({
      category: COMPONENT_LOCATION[view],
      action: "Navigate",
    });
    setView(view);
  };

  const handleWebSocketConnect = (webSocketRef) => {
    const mainSocket = webSocketRef.current;

    connectionKeys.forEach((connectionKey) => {
      const addUser = `/chat/addUser/main/${connectionKey}/${destination}`;
      mainSocket.sendMessage(addUser, userkeycloakId);
    });

    setWebSocketRef(webSocketRef);
  };

  const handleWebSocketMessage = (message) => {
    console.log("handleWebSocketMessage", message);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

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
            {view !== COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
              <MessageManagementLink setView={handleSetView} />
            )}
            <MuiDivider variant="fullWidth" />
            {view === COMPONENT_LOCATION.CHAT_MESSAGES && (
              <RenderChat
                initialInfo={currentChat}
                chatApiUrl={chatInitConfig.chatApiUrl}
                userkeycloakId={userkeycloakId}
                chatService={chatService}
                onReadAllMessagesOfChat={(readChat) =>
                  onReadAllMessagesOfChat(
                    componentInfo,
                    setComponentInfo,
                    readChat
                  )
                }
                navigateWhenCurrentChat={chatInitConfig.navigateWhenCurrentChat}
                onChatStatusChanged={(statusChangedChat, isBlocked) =>
                  onChatStatusChanged(
                    statusChangedChat,
                    isBlocked,
                    componentInfo,
                    setChatToSendNotification
                  )
                }
                userNamesById={componentInfo.userNameById}
                mobile={mobile}
                setView={setView}
                customActions={customActions}
                setDrawerOpen={setOpenDrawer}
                clientRef={webSocketRef}
                receivedMessage={receivedMessage}
              />
            )}
            {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
              <MessageManagement
                loading={loading}
                setLoading={setLoading}
                onlyNotClients={onlyNotClients}
                setOnlyNotClients={setOnlyNotClients}
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
                chat={chatToSendNotification}
                userPhoneNumber={chatInitConfig.userPhoneNumber || ""}
                chatApiUrl={chatInitConfig.chatApiUrl}
                connectionKeys={componentInfo.connectionKeys}
                destination={componentInfo.destination}
                createPath={chatInitConfig.createPath}
                productService={productService}
                chatService={chatService}
                info={componentInfo.sendNotificationInfo}
                extraFields={componentInfo.extraFields}
                reloadComponent={reloadComponent}
                setChat={setCurrentChat}
                setView={setView}
                token={token}
                userId={userkeycloakId}
              />
            )}
            {showSendNotification && (
              <StartNewChatButton
                classes={classes}
                onStartSendNotification={() =>
                  onStartSendNotification(
                    view,
                    setChatToSendNotification,
                    setView
                  )
                }
                view={view}
                theme={theme}
                mobile={mobile}
              />
            )}
            {view === COMPONENT_LOCATION.CHAT_MESSAGES && mobile && (
              <div className={classes.mobileCloseChatButton}>
                <Icon
                  onClick={() => setView(COMPONENT_LOCATION.MESSAGE_MANAGEMENT)}
                  color={theme.palette.primary.main}
                  size={1.25}
                  style={closeIconStyles}
                  path={mdiClose}
                />
              </div>
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
        {chatInitConfig.clickOnUnreadOpenFirstAction && (
          <Dialog
            open={
              chatToOpenFirstAction &&
              Object.keys(chatToOpenFirstAction).length > 0
            }
            onClose={() => setChatToOpenFirstAction({})}
            aria-labelledby="dialog-title"
          >
            <DialogTitle id="dialog-title">Confirmação</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Voce será direcionado e pode perder a ação que está executando
                no momento. Deseja continuar?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                autoFocus
                onClick={() => setChatToOpenFirstAction({})}
                color="primary"
              >
                Não
              </Button>
              <Button
                onClick={() => {
                  const encodedData = oldEncodeChatData(
                    chatToOpenFirstAction,
                    userkeycloakId
                  );

                  window.open(
                    `${chatToOpenFirstAction.actions[0].path}?data=${encodedData}`,
                    "_self"
                  );
                }}
                color="primary"
                autoFocus
              >
                Sim
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    </>
  );
};
