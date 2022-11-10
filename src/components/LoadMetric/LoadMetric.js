import React, { useEffect, useState } from "react";

export const LoadMetric = ({
  metricId,
  userkeyloakId,
  children,
  chatService,
}) => {
  const [initialValue] = useState(Date.now());

  useEffect(
    () => () => {
      const finalValue = Date.now() - initialValue;
      const metric = {
        at: initialValue,
        userId: userkeyloakId,
        viewName: metricId,
        totalTime: finalValue,
      };

      chatService.sendComponentMetric(metric);
    },
    [initialValue, metricId, userkeyloakId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <>{children}</>;
};
