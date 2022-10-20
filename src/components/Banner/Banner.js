import React from "react";
import { useStyle } from "./styles";

export const Banner = ({ imgUrl, formUrl, formParams }) => {
  const classes = useStyle();

  const completeFormUrl = () => {
    // eslint-disable-next-line no-shadow
    let completeFormUrl = formUrl;

    if (!formParams) {
      return completeFormUrl;
    }

    Object.keys(formParams).forEach((key) => {
      completeFormUrl += `&${key}=${formParams[key]}`;
    });

    return completeFormUrl;
  };

  return (
    <div>
      <a href={completeFormUrl()}>
        <img alt="" className={classes.banner} src={imgUrl} />
      </a>
    </div>
  );
};
