import React, { useCallback } from "react";
import {
  debounce,
  FormControlLabel,
  Switch,
  Typography,
} from "@material-ui/core";
import { Input } from "@tecsinapse/ui-kit";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import { useStyle } from "./styles";

export const TableHeader = ({
  onlyNotClients,
  setOnlyNotClients,
  globalSearch,
  setGlobalSearch,
}) => {
  const classes = useStyle();

  const handleChangeOnlyNotClients = () => {
    setOnlyNotClients(!onlyNotClients);
  };

  const debounceGlobalSearch = useCallback(
    debounce((value) => {
      setGlobalSearch(value);
    }, 800),
    []
  );

  const handleChangeGlobalSearch = (event) => {
    if (event.target.value !== globalSearch) {
      debounceGlobalSearch(event.target.value);
    }
  };

  return (
    <>
      <div className={classes.display}>
        <Typography variant="h6">Clientes do Chat</Typography>
        <FormControlLabel
          label="Exibir apenas clientes não cadastrados no sistema"
          control={<Switch size="small" />}
          onChange={handleChangeOnlyNotClients}
          checked={onlyNotClients}
        />
        <Typography variant="caption" className={classes.appVersion}>
          Versão: {process.env.REACT_APP_VERSION}
        </Typography>
      </div>
      <Input
        fullWidth
        placeholder="Pesquise por dados em qualquer campo"
        name="globalSearch"
        defaultValue={globalSearch}
        classes={{ input: classes.input }}
        startAdornment={<Icon path={mdiMagnify} size={1} color="#c6c6c6" />}
        onChange={handleChangeGlobalSearch}
      />
    </>
  );
};
