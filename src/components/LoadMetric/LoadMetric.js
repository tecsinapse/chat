import React, { useEffect, useState } from "react";

export const LoadMetric = ({ metricId, userkeyloakId, children }) => {
  const [initialValue] = useState(Date.now());

  useEffect(
    () => () => {
      const finalValue = Date.now() - initialValue;

      console.log("inicio da carga = ", new Date(initialValue));
      console.log("usuário logado = ", userkeyloakId);
      console.log("id da métrica = ", metricId);
      console.log("tempo da carga = ", finalValue);
      console.log("---------------");
    },
    [initialValue, metricId, userkeyloakId]
  );

  return <>{children}</>;
};
