import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import React from "react";
import ReactGA from "react-ga4";
import { COMPONENT_VIEW } from "../../constants/COMPONENT_VIEW";

export const DeleteChat = ({
  productService,
  chatToDelete,
  setChatToDelete,
  chatService,
  setConnectionError,
  setView,
  setDeleting,
}) => {
  const handleDeleteChat = () => {
    productService
      .deleteChat(chatToDelete)
      .then(() => {
        chatService
          .deleteSessionChat(chatToDelete)
          .then(() => {
            const { connectionKey } = chatToDelete;

            ReactGA.event({
              category: connectionKey,
              action: "Discard Chat",
            });

            if (setChatToDelete) {
              setChatToDelete(null);
            }
            setDeleting(false);
            setView(COMPONENT_VIEW.MESSAGE_MANAGEMENT);
          })
          .catch(() => {
            if (setChatToDelete) {
              setChatToDelete(null);
            }
            setDeleting(false);
            setConnectionError(true);
          });
      })
      .catch(() => {
        setChatToDelete(null);
        setDeleting(false);
        setConnectionError(true);
      });
  };

  const handleCloseDeleteChat = () => {
    if (setChatToDelete) {
      setChatToDelete(null);
    }
    setDeleting(false);
  };

  return (
    <Dialog open={chatToDelete} onClose={handleCloseDeleteChat}>
      <DialogTitle>Arquivar Conversa</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que você deseja arquivar essa conversa?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCloseDeleteChat} color="primary">
          Não
        </Button>
        <Button onClick={handleDeleteChat} color="primary" autoFocus>
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
};
