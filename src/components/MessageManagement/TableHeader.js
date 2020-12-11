import React from "react";
import { Typography, FormControlLabel, Switch } from "@material-ui/core";
import { Input } from "@tecsinapse/ui-kit";
import { makeStyles } from "@material-ui/styles";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";

export const TableHeader = ({
  showNotClient,
  switchToOnlyNotClients,
  headerClass,
  globalSearch,
  setGlobalSearch,
  mobile,
}) => {
  const classes = useStyle(mobile)();

  const iconMargin = { marginRight: 6 };

  return (
    <>
      <div className={headerClass} style={{ display: "flex" }}>
        <Typography variant="h6" className={classes.marginRight}>
          Clientes do Chat
        </Typography>
        <FormControlLabel
          control={<Switch size="small" />}
          checked={showNotClient}
          onChange={switchToOnlyNotClients}
          label="Exibir apenas clientes não cadastrados no sistema"
          classes={{
            root: classes.marginRight,
            label: classes.label,
          }}
        />
      </div>
      <Input
        fullWidth
        placeholder="Pesquise por dados em qualquer campo"
        name="filtroGlobal"
        value={globalSearch}
        classes={{
          input: classes.input,
        }}
        startAdornment={
          <Icon path={mdiMagnify} size={1} color="#c6c6c6" style={iconMargin} />
        }
        onChange={(e) => setGlobalSearch(e.target.value)}
      />
    </>
  );
};

const useStyle = (mobile) =>
  makeStyles(({ spacing }) => {
    const mobileStyles = mobile
      ? {
          marginTop: 6,
          width: "102vw",
          left: -22,
          backgroundColor: "rgba(0,0,0,0.06)",
        }
      : {};
    return {
      label: {
        fontSize: "12px",
        fontWeight: "bold",
      },
      marginRight: { marginRight: spacing(2) },
      input: {
        ...mobileStyles,
      },
    };
  });
