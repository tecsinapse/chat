import { createRef, useEffect } from "react";

export default function useComponentInfo(
  componentInfo,
  setMainSocketClientRefs
) {
  useEffect(() => {
    if (componentInfo?.connectionKeys) {
      const socketClientRefs = {};
      componentInfo.connectionKeys.forEach((connectionKey) => {
        socketClientRefs[connectionKey] = createRef();
      });
      setMainSocketClientRefs(socketClientRefs);
    }
  }, [componentInfo]); // eslint-disable-line react-hooks/exhaustive-deps
}
