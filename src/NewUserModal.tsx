import * as React from "react";
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

// Propsの型定義
interface NewUserModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  birthday: string;
  setBirthday: (value: string) => void;
  group_id: string;
  setGroupId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleRegister: () => void; // 修正
}

export default function NewUserModal({
  open,
  onClose,
  name,
  setName,
  email,
  setEmail,
  birthday,
  setBirthday,
  group_id,
  setGroupId,
  status,
  setStatus,
  password,
  setPassword,
  handleRegister,
}: NewUserModalProps) {
  return (
    <BootstrapDialog onClose={onClose} open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }}>ユーザ作成・編集</DialogTitle>
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
            <TextField id="name" label="名前" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} />
          </Typography>
          <Typography gutterBottom>
            <TextField id="email" label="メールアドレス" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Typography>
          <Typography gutterBottom>
            <TextField id="password" label="パスワード" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Typography>
          <Typography gutterBottom>
            <TextField id="birthday" label="誕生日" variant="outlined" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </Typography>
          <Typography gutterBottom>
            <TextField id="group_id" label="グループID" variant="outlined" value={group_id} onChange={(e) => setGroup(e.target.value)} />
          </Typography>
          <Typography gutterBottom>
            <TextField id="status" label="ステータス" variant="outlined" value={status} onChange={(e) => setStatus(e.target.value)} />
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleRegister}>登録</Button>
      </DialogActions>
    </BootstrapDialog>
  )
}