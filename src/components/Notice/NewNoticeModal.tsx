import * as React from "react";
import { useState, ChangeEvent } from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// モーダルのスタイル設定
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface NewNoticeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  handleRegister: () => void;
  setUploadfile: (file: File | null) => void; // ファイルを設定する関数を受け取る
  attachedFile: { file_name: string; path: string } | null; // 既存の添付ファイルデータ
  setAttachedFile: (file: null) => void; // 添付ファイルデータをリセットする関数
  handleFileDelete: () => void; 
}

// Propsの型定義
interface NewNoticeModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (title: string, content: string) => void;
}

export default function NewNoticeModal({
  open,
  onClose,
  title,
  setTitle,
  content,
  setContent,
  handleRegister,
  setUploadfile,
  attachedFile,
  setAttachedFile,
  handleFileDelete
}: NewNoticeModalProps) {
  //const [file, setFile] = useState<File | null>(null);

  // 添付ファイル選択時の処理
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const selectedFile = event.target.files[0];
    setUploadfile(selectedFile); // 親コンポーネントにファイルを渡す
  };

  return (
    <BootstrapDialog onClose={onClose} open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }}>お知らせ作成・編集</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Box component="form" sx={{ "& > :not(style)": { m: 1, width: "50ch" } }} noValidate autoComplete="off">
          <Typography gutterBottom>
            <TextField id="title" label="件名" variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Typography>
          <Typography gutterBottom>
            <ReactQuill value={content} onChange={setContent} theme="snow" />
          </Typography>
          <Typography gutterBottom>
            {attachedFile && attachedFile.file_name ? (
                <div>
                    <span>{attachedFile.file_name}</span>
                    <IconButton
                        onClick={handleFileDelete} // handleFileDelete を呼び出す
                        className="ml-2 text-red-500 underline"
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
            ) : (
                <input
                    type="file"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setUploadfile(e.target.files[0]);
                        }
                    }}
                />
            )}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleRegister}>登録</Button>
      </DialogActions>
    </BootstrapDialog>
  );
};