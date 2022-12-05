import React, { useRef, useState } from "react";
import axios from "axios";
import {
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import { PreviewList, Uploader } from "@tecsinapse/uploader";
import Icon from "@mdi/react";
import { mdiFileUpload } from "@mdi/js";
import { downloadByLink } from "../utils";

const FileUploader = ({
  uploaderRef,
  onAccept,
  onReject,
  files,
  setOpen,
  open,
  onDelete,
  filesLimit,
  maxFileSize,
  acceptedFormats,
  dialogContent,
  silent,
}) => (
  <>
    <Uploader
      ref={uploaderRef}
      onAccept={onAccept}
      onReject={onReject}
      value={files}
      filesLimit={filesLimit}
      acceptedFormat={acceptedFormats}
      silent={silent}
      maxFileSize={maxFileSize}
      messages={{
        title: "Arraste seu(s) arquivo(s) aqui",
        buttonLabel: "Upload de arquivos",
        subtitle: "ou clique no botão",
        filetypeNotSupportedMessage: `Tipo de arquivo não suportado.`,
        maximumFileLimitMessage: (limit) =>
          `O número de arquivos permitidos é ${limit}`,
        maximumFileNumberMessage: "Número de arquivos excedido",
        filenameFailedMessage: () => `Tipo de arquivo não suportado.`,
        sizeLimitErrorMessage: (size) => `Limite de tamanho: ${size}.`,
      }}
    />
    <Dialog
      onClose={() => setOpen(false)}
      open={open}
      aria-labelledby="simple-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Enviando arquivos</DialogTitle>
      <DialogContent>
        <PreviewList
          value={files}
          onDelete={onDelete}
          messages={{
            fileErroedMessage: (fileName) =>
              `Erro ao enviar o arquivo ${fileName}. Verifique o formato e tente novamente`,
            fileUploadedSucessfullyMessage: (fileName) =>
              `${fileName} recebido com sucesso`,
          }}
        />
        <div>{dialogContent}</div>
      </DialogContent>
    </Dialog>
  </>
);

const SingleFileUploader = ({
  connectionKey,
  uploaderRef,
  acceptedFormats,
  maxFileSize,
  handleUpload,
}) => {
  const [file, setFile] = useState({});
  const [cancelToken, setCancelToken] = useState(null);
  const [open, setOpen] = useState(false);

  const handleAccept = (newFiles) => {
    setOpen(true);
    const fileObj = {
      file: newFiles[0],
      completed: 0,
    };

    setFile(fileObj);
    setTimeout(() => upload(fileObj), 1000);
  };

  const handleReject = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    cancelToken.cancel();
    setFile({});
    setOpen(false);
  };

  const upload = async (fileObj) => {
    const formData = new FormData();

    formData.append("file", fileObj.file);

    const source = axios.CancelToken.source();

    setCancelToken(source);

    await axios
      .post(`/api/chats/${connectionKey}/upload/media`, formData, {
        headers: {
          Authorization: process.env.REACT_APP_FETCH_TOKEN,
          "Content-Type": "multipart/form-data",
        },
        cancelToken: source.token,
      })
      .then(({ data }) => {
        const completedFile = { ...fileObj };

        completedFile.completed = 100;
        setFile(completedFile);
        setTimeout(() => setOpen(false), 3000);
        handleUpload(data);
      })
      .catch(() => {
        setOpen(false);
        setFile({});
      });
  };

  let files = {};

  if (file.file) {
    files = { ...files, file };
  }

  return (
    <FileUploader
      uploaderRef={uploaderRef}
      onAccept={handleAccept}
      onReject={handleReject}
      onDelete={handleDelete}
      files={files}
      open={open}
      setOpen={setOpen}
      acceptedFormats={acceptedFormats}
      filesLimit={1}
      maxFileSize={maxFileSize}
      silent
    />
  );
};

export const MediaUploader = ({
  connectionKey,
  mediaType,
  currentMedia,
  handleUpload,
  handleDelete,
}) => {
  const uploaderRef = useRef();
  const anchorRef = useRef();

  const handleOpen = () => {
    uploaderRef.current.open();
  };

  const handleDownload = (link) => () => {
    downloadByLink(link);
  };

  return (
    <Grid direction="column" container>
      {!currentMedia && mediaType && (
        <Grid item xs={12}>
          <ButtonGroup variant="contained" color="primary" ref={anchorRef}>
            <Button onClick={handleOpen}>
              <Icon path={mdiFileUpload} size={0.9} color="white" />
              Anexar {mediaType.label}
            </Button>
          </ButtonGroup>
        </Grid>
      )}
      {mediaType && (
        <SingleFileUploader
          connectionKey={connectionKey}
          uploaderRef={uploaderRef}
          acceptedFormats={mediaType.acceptedFormats}
          maxFileSize={mediaType.maxFileSize}
          handleUpload={handleUpload}
        />
      )}
      {currentMedia && (
        <Grid item xs={12}>
          <Chip
            icon={<Icon path={mediaType.icon} size={0.7} color="black" />}
            label={currentMedia.name}
            onDelete={handleDelete}
            onClick={handleDownload(currentMedia.url)}
          />
        </Grid>
      )}
    </Grid>
  );
};
