import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Loading} from "./../Util/Loading";

export const UploaderDialog = ({
                                 open = false,
                                 setOpen
                               }) => {

  return (
    <Dialog
      onClose={() => setOpen(false)}
      open={open}
      aria-labelledby="simple-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Enviando Arquivos</DialogTitle>
      <DialogContent>
        <Loading/>
      </DialogContent>
    </Dialog>
  );
};
