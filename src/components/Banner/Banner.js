import React, { useEffect, useState } from "react";
import { useStyle } from "./styles";

export const Banner = ({ props }) => {
  const [urlTallyForm, setUrlTallyForm] = useState(props?.tallyFormUrl);

  const classes = useStyle();

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!props || !props.tallyParams) {
      return;
    }

    Object.keys(props.tallyParams).forEach(function getKey(key) {
      setUrlTallyForm(
        (oldUrlTallyForm) =>
          `${oldUrlTallyForm}&${key}=${props.tallyParams[key]}`
      );
    });
  }, [props, setUrlTallyForm]);

  return (
    <div>
      <a href={urlTallyForm}>
        <img alt="" className={classes.banner} src={props?.imgUrl} />
      </a>
    </div>
  );
};
