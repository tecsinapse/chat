import { useEffect } from "react";
import { loadComponent } from "../utils/helpers";

export default function useLoadComponent({
  chatInitConfig,
  setComponentInfo,
  setIsLoadingInitialState,
  setView,
  setCurrentChat,
  userMock,
  token,
  setIsDrawerOpen,
}) {
  useEffect(() => {
    loadComponent(
      chatInitConfig,
      setComponentInfo,
      setIsLoadingInitialState,
      setView,
      setCurrentChat,
      userMock,
      token
    ).then(() => {
      if (chatInitConfig?.openImmediately) {
        setIsDrawerOpen(true);
      }
    });
  }, [
    chatInitConfig,
    setComponentInfo,
    setIsLoadingInitialState,
    setView,
    setCurrentChat,
    setIsDrawerOpen,
    userMock,
    token,
  ]);
}
