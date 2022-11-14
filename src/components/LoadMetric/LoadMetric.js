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
        userId: userkeyloakId,
        metricId,
        totalTime: finalValue,
      };

      chatService.sendComponentMetric(metric).catch((error) => {
        console.error(error);
      });
    },
    [initialValue, metricId, userkeyloakId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <>{children}</>;
};
