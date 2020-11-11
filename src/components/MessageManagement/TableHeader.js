import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import React from "react";
import { makeStyles } from "@material-ui/styles";

const useStyle = makeStyles((theme) => ({
  label: {
    fontSize: "12px",
    fontWeight: "bold",
  },
  marginRight: { marginRight: theme.spacing(2) },
}));

export const TableHeader = ({
  showNotClient,
  switchToOnlyNotClients,
  headerClass,
}) => {
  const classes = useStyle();

  return (
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
  );
};
