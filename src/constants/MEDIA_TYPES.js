import { mdiFilePdf, mdiImage, mdiVideo } from "@mdi/js";

export const MEDIA_TYPES = {
  IMAGE: {
    label: "Imagem",
    icon: mdiImage,
    templateArgKey: "imageUrl",
    acceptedFormats: [".jpeg", ".png"],
    maxFileSize: 5000000,
  },
  VIDEO: {
    label: "Video",
    icon: mdiVideo,
    templateArgKey: "videoUrl",
    acceptedFormats: [".mp4"],
    maxFileSize: 16000000,
  },
  DOCUMENT: {
    label: "Arquivo PDF",
    icon: mdiFilePdf,
    templateArgKey: "documentUrl",
    acceptedFormats: [".pdf"],
    maxFileSize: 16000000,
  },
};
