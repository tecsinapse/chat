import React from "react";
import { useStyle } from "./styles";

export const Banner = ({ imgUrl, formUrl, formParams }) => {
  const classes = useStyle();

  const completeFormUrl = () => {
    let urlWithParams = formUrl;

    if (!formParams) {
      return urlWithParams;
    }

    Object.keys(formParams).forEach((key) => {
      urlWithParams += `&${key}=${formParams[key]}`;
    });

    return urlWithParams;
  };

  return (
    <div>
      <a href={completeFormUrl()}>
        <img alt="" className={classes.banner} src={imgUrl} />
      </a>
    </div>
  );
};
