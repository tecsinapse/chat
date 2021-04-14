import { useEffect } from "react";
import { loadComponent } from "../utils/helpers";

export default function useLoadComponent(propsToLoadComponent) {
  const {
    chatInitConfig,
    setComponentInfo,
    setIsLoadingInitialState,
    setView,
    setCurrentChat,
    setIsDrawerOpen,
    userMock,
    token,
  } = propsToLoadComponent;

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
      setIsLoadingInitialState,
      setView,
      setCurrentChat,
      setIsDrawerOpen,
      userMock,
      token,
    ]
  );
}