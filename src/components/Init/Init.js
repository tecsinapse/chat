import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { UnreadChats } from "../UnreadChats/UnreadChats";
import { RenderChat } from "../RenderChat/RenderChat";
import InitWebsockets from "./InitWebsockets";
import { MessageManagement } from "../MessageManagement/MessageManagement";
import { ChatButton } from "../ChatButton/ChatButton";
import { oldEncodeChatData } from "../../utils/oldEncodeChatData";
import { SendNotification } from "../SendNotification/SendNotification";
import { useStyle } from "./styles";
import { StartNewChatButton } from "../StartNewChatButton/StartNewChatButton";

import {
  disableNotificationSound,
  enableNotificationSound,
  getChatIdsByConnectionKey,
  getUnreadTotal,
  isChatViewAndIsBlocked,
  isNotificationSoundEnabled,
  isShowBackButton,
  isShowMessageManagement,
  isShowSendNotification,
  onChatStatusChanged,
  onLocalStorage,
  onReadAllMessagesOfChat,
  onStartSendNotification,
  onUpdatedChat,
} from "./functions";
import { HeaderDrawer } from "./HeaderDrawer";
import { ItemDrawer } from "./ItemDrawer";
import { ProductService } from "../../service/ProductService";
import { ChatService } from "../../service/ChatService";
import { loadComponent, messageEventListener } from "../../utils/helpers";

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

const InitContext = ({
  chatInitConfig,
  customizeStyles,
  customActions,
  mobile = false,
  userMock,
  token,
}) => {
  const productService = new ProductService(chatInitConfig.createPath);
  const chatService = new ChatService(`${chatInitConfig.chatApiUrl}/api/chats`);

  const homeLocation = chatInitConfig.onlyMessageManagement
    ? COMPONENT_LOCATION.MESSAGE_MANAGEMENT
    : COMPONENT_LOCATION.UNREAD;

  const classes = useStyle(customizeStyles, mobile)();
  const theme = useTheme();
  const [firstLoad, setFirstLoad] = useState(true);
  const [view, _setView] = useState(homeLocation);
  const [componentInfo, setComponentInfo] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatToOpenFirstAction, setChatToOpenFirstAction] = useState({});
  const [chatToSendNotification, setChatToSendNotification] = useState();
  const [receivedMessage, setReceivedMessage] = useState();
  const [unreadTotal, setUnreadTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [onlyNotClients, setOnlyNotClients] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [page, setPage] = useState(0);

  const [selectedChat, setSelectedChat] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  const { userkeycloakId, pageSize } = chatInitConfig;

  const [notificationSound, setNotificationSound] = useState(
    isNotificationSoundEnabled(userkeycloakId)
  );

  const setView = React.useCallback((args) => {
    ReactGA.event({
      category: COMPONENT_LOCATION[args],
      action: "Navigate",
    });
    _setView(args);
  }, []);

  const mainSocketRef = useRef();

  const propsToLoadComponent = {
    chatInitConfig,
    globalSearch,
    setComponentInfo,
    view,
    setView,
    setCurrentChat,
    userMock,
    token,
    setIsDrawerOpen,
    chatService,
    firstLoad,
    setFirstLoad,
    page,
  };

  useEffect(
    () => {
      loadComponent(propsToLoadComponent).then(() => {
        if (chatInitConfig?.openImmediately) {
          setIsDrawerOpen(true);
        }
      });
    }, // eslint-disable-next-line
    [
      chatInitConfig,
      setComponentInfo,
      setView,
      setCurrentChat,
      setIsDrawerOpen,
      userMock,
      token,
    ]
  );

  const reloadComponent = useCallback(
    () => loadComponent(propsToLoadComponent),
    [propsToLoadComponent]
  );

  const registerChatIds = useCallback(() => {
    if (!componentInfo) {
      return;
    }

    const mainSocket = mainSocketRef.current;

    if (!mainSocket) {
      return;
    }

    const { connectionKeys, destination } = componentInfo;
    const { userkeycloakId } = chatInitConfig;

    const distinctConnectionKeys = connectionKeys
      .map((it) => it.value)
      .filter((it, index, self) => self.indexOf(it) === index);

    distinctConnectionKeys.forEach((connectionKey) => {
      const addUser = `/chat/addUser/main/${connectionKey}/${destination}/${userkeycloakId}`;

      const chatIds = getChatIdsByConnectionKey(
        componentInfo.allChats,
        connectionKey
      );

      try {
        mainSocket.sendMessage(addUser, chatIds.join(","));
      } catch (e) {
        console.error(e);
      }
    });
  }, [chatInitConfig, componentInfo, mainSocketRef]);

  useEffect(
    () =>
      window.addEventListener("message", async (event) => {
        await messageEventListener(
          event,
          propsToLoadComponent,
          setChatToSendNotification,
          setView,
          setIsDrawerOpen
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(registerChatIds, [firstLoad]);

  useEffect(() => {
    if (componentInfo && componentInfo.allChats) {
      const newUnreadTotal = getUnreadTotal(componentInfo?.allChats);
      console.log("recontou unreads", newUnreadTotal);
      setUnreadTotal(newUnreadTotal);
    }
  }, [componentInfo]);

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
    view === COMPONENT_LOCATION.CHAT &&
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

  const onNotificationSoundChange = () => {
    if (notificationSound === true) {
      disableNotificationSound(userkeycloakId);
      setNotificationSound(false);
    } else {
      enableNotificationSound(userkeycloakId);
      setNotificationSound(true);
    }
  };

  window.onstorage = onLocalStorage(userkeycloakId, setNotificationSound);

  const closeIconStyles = { cursor: "pointer" };

  return (
    <>
      {chatInitConfig.customChatButton &&
        chatInitConfig.customChatButton(
          firstLoad,
          unreadTotal,
          setIsDrawerOpen
        )}
      <div className="Chat">
        {!chatInitConfig.customChatButton && !isDrawerOpen && (
          <ChatButton
            firstLoad={firstLoad}
            setIsDrawerOpen={setIsDrawerOpen}
            unreadTotal={unreadTotal}
          />
        )}
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <div className={classes.drawerContainer}>
            <HeaderDrawer
              view={view}
              chatInitConfig={chatInitConfig}
              theme={theme}
              classes={classes}
              homeLocation={homeLocation}
              setIsDrawerOpen={setIsDrawerOpen}
              setView={setView}
              showBackButton={showBackButton}
              unreadTotal={unreadTotal}
              onNotificationSoundChange={onNotificationSoundChange}
              notificationSound={notificationSound}
            />
            <MuiDivider variant="fullWidth" />
            {showMessageManagement && (
              <ItemDrawer classes={classes} theme={theme} setView={setView} />
            )}
            <MuiDivider variant="fullWidth" />
            {view === COMPONENT_LOCATION.UNREAD && (
              <UnreadChats
                chats={componentInfo.allChats}
                unreadTotal={unreadTotal}
                onSelectChat={onSelectUnreadChat}
                mobile={mobile}
              />
            )}
            {view === COMPONENT_LOCATION.CHAT && (
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
                setDrawerOpen={setIsDrawerOpen}
                clientRef={mainSocketRef}
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
                setView={setView}
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
            {view === COMPONENT_LOCATION.CHAT && mobile && (
              <div className={classes.mobileCloseChatButton}>
                <Icon
                  onClick={() => setView(homeLocation)}
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
          <InitWebsockets
            chatApiUrl={chatInitConfig.chatApiUrl}
            userkeycloakId={userkeycloakId}
            destination={componentInfo.destination}
            reloadComponent={reloadComponent}
            onChatUpdated={(componentInfo, updatedChat) =>
              onUpdatedChat(
                userkeycloakId,
                updatedChat,
                setCurrentChat,
                currentChat,
                componentInfo,
                setComponentInfo
              )
            }
            mainSocketRef={mainSocketRef}
            setReceivedMessage={setReceivedMessage}
            onConnectMainSocket={registerChatIds}
            componentInfo={componentInfo}
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
