import React, { useContext, useState, useRef } from "react";
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

import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { UnreadChats } from "../UnreadChats/UnreadChats";
import { RenderChat } from "../RenderChat/RenderChat";
import InitWebsockets from "./InitWebsockets";
import { MessageManagement } from "../MessageManagement/MessageManagement";
import { ChatButton } from "../ChatButton/ChatButton";
import { encodeChatData } from "../../utils/encodeChatData";
import { SendNotification } from "../SendNotification/SendNotification";
import { useStyle } from "./styles";
import { StartNewChatButton } from "../StartNewChatButton/StartNewChatButton";

import {
  getUnreadTotal,
  onUpdatedChat,
  getChatIds,
  onReadAllMessagesOfChat,
  onDeleteChat,
  onChatStatusChanged,
  isShowBackButton,
  isShowMessageManagement,
  isChatViewAndIsBlocked,
  isShowSendNotification,
  onStartSendNotification,
} from "./functions";

import useLoadComponent from "../../hooks/useLoadComponent";
import { HeaderDrawer } from "./HeaderDrawer";
import { ItemDrawer } from "./ItemDrawer";
import { ProductService } from "../../service/ProductService";
import { ChatService } from "../../service/ChatService";
import ChatContext, { allChatsMap } from "../../context";
import { loadComponent } from "../../utils/helpers";
import ReactGA from "react-ga4";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const Init = (props) => {
  const [state, setState] = useState(allChatsMap);

  React.useLayoutEffect(() => {
    ReactGA.initialize(process.env.REACT_APP_GA_ID, {
      gaOptions: {
        chatVersion: process.env.REACT_APP_VERSION,
        appVersion: process.env.REACT_APP_VERSION,
      },
    });
  }, []);

  React.useEffect(() => {
    ReactGA.set({
      userId: props?.chatInitConfig?.userkeycloakId,
    });
    ReactGA.send({ hitType: "pageview", page: "/init" });
  }, [props]);

  return (
    <ChatContext.Provider value={[state, setState]}>
      <QueryClientProvider client={queryClient}>
        <InitContext {...props} />
      </QueryClientProvider>
    </ChatContext.Provider>
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
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [view, _setView] = useState(homeLocation);
  const [componentInfo, setComponentInfo] = useState({});
  const [currentChat, setCurrentChat] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatToOpenFirstAction, setChatToOpenFirstAction] = useState({});
  const [chatToSendNotification, setChatToSendNotification] = useState();
  const [receivedMessage, setReceivedMessage] = useState();

  const setView = React.useCallback((args) => {
    ReactGA.event({
      category: COMPONENT_LOCATION[args],
      action: "Navigate",
    });
    _setView(args);
  }, []);

  // Utilizado para notificar componentes quando o socket reconecta
  // na situação de haver perda de conexão
  const [connectedAt, setConnectedAt] = useState();

  const mainSocketRef = useRef();

  const [chatContext, setChatContext] = useContext(ChatContext);
  const allChats = Array.from(chatContext.values());

  const propsToLoadComponent = {
    chatInitConfig,
    setComponentInfo,
    setIsLoadingInitialState,
    setView,
    setCurrentChat,
    userMock,
    token,
    setIsDrawerOpen,
    setChatContext,
    chatService,
    firstLoad,
    setFirstLoad,
  };

  useLoadComponent(propsToLoadComponent);

  const reloadComponent = () => loadComponent(propsToLoadComponent);

  const chatIds = getChatIds(componentInfo?.allChats);
  const unreadTotal = getUnreadTotal(allChats);

  const onSelectUnreadChat = (chat) => {
    if (chatInitConfig.clickOnUnreadOpenFirstAction) {
      setChatToOpenFirstAction(chat);
    } else {
      onSelectChat(chat);
    }
  };

  const onSelectChat = (chat) => {
    setCurrentChat({
      name: chat.name,
      connectionKey: chat.connectionKey,
      destination: chat.destination,
      disabled: !chat.enabled,
      status: chat.status,
      chats: [chat],
    });
    setView(COMPONENT_LOCATION.CHAT);
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

  const closeIconStyles = { cursor: "pointer" };

  return (
    <>
      {chatInitConfig.customChatButton &&
        chatInitConfig.customChatButton(
          isLoadingInitialState,
          unreadTotal,
          setIsDrawerOpen
        )}
      <div className="Chat">
        {!chatInitConfig.customChatButton && !isDrawerOpen && (
          <ChatButton
            isLoadingInitialState={isLoadingInitialState}
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
            />
            <MuiDivider variant="fullWidth" />
            {showMessageManagement && (
              <ItemDrawer classes={classes} theme={theme} setView={setView} />
            )}
            <MuiDivider variant="fullWidth" />
            {view === COMPONENT_LOCATION.UNREAD && (
              <UnreadChats
                chats={allChats}
                onSelectChat={onSelectUnreadChat}
                mobile={mobile}
              />
            )}
            {view === COMPONENT_LOCATION.CHAT && (
              <RenderChat
                initialInfo={currentChat}
                chatApiUrl={chatInitConfig.chatApiUrl}
                userkeycloakId={chatInitConfig.userkeycloakId}
                chatService={chatService}
                onReadAllMessagesOfChat={(readChat) =>
                  onReadAllMessagesOfChat(
                    componentInfo,
                    readChat,
                    chatContext,
                    setChatContext
                  )
                }
                navigateWhenCurrentChat={chatInitConfig.navigateWhenCurrentChat}
                onChatStatusChanged={(statusChangedChat, isBlocked) =>
                  onChatStatusChanged(
                    statusChangedChat,
                    isBlocked,
                    chatContext,
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
                connectedAt={connectedAt}
              />
            )}
            {view === COMPONENT_LOCATION.MESSAGE_MANAGEMENT && (
              <MessageManagement
                componentInfo={componentInfo}
                onSelectChat={onSelectChat}
                onDeleteChat={(deletedChat) =>
                  onDeleteChat({
                    deletedChat,
                    token,
                    componentInfo,
                    setComponentInfo,
                    productService,
                    chatService,
                    chatContext,
                    setChatContext,
                  })
                }
                userkeycloakId={chatInitConfig.userkeycloakId}
                showMessagesLabel={chatInitConfig.showMessagesLabel}
                showDiscardOption={chatInitConfig.showDiscardOption}
                headerClass={classes.messageManagementHeader}
                mobile={mobile}
                customActions={customActions}
                setDrawerOpen={setIsDrawerOpen}
                chatService={chatService}
                reload={reloadComponent}
              />
            )}
            {view === COMPONENT_LOCATION.SEND_NOTIFICATION && (
              <SendNotification
                chat={chatToSendNotification}
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
                componentInfo={componentInfo}
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
        {!isLoadingInitialState && (
          <InitWebsockets
            chatApiUrl={chatInitConfig.chatApiUrl}
            userkeycloakId={chatInitConfig.userkeycloakId}
            chatIds={chatIds}
            reloadComponent={reloadComponent}
            connectionKeys={componentInfo.connectionKeys}
            destination={componentInfo.destination}
            onChatUpdated={(updatedChat) =>
              onUpdatedChat(
                updatedChat,
                setCurrentChat,
                currentChat,
                chatContext,
                setChatContext,
                componentInfo
              )
            }
            mainSocketRef={mainSocketRef}
            setReceivedMessage={setReceivedMessage}
            setConnectedAt={setConnectedAt}
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
                  const encodedData = encodeChatData(
                    chatToOpenFirstAction,
                    chatInitConfig.userkeycloakId
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
