import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { supabase } from "./hooks/supabaseClient";
import { useEffect, useState } from "react";

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

//プルダウン
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
//カレンダー
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ja";

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
  status_id: string;
  setStatusId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleRegister: () => void;

  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
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
  status_id,
  setStatusId,
  password,
  setPassword,
  handleRegister,
  selectedGroup,
  setSelectedGroup,
  selectedStatus,
  setSelectedStatus,
}: NewUserModalProps) {
  const [groups, setGroups] = useState([]);
  const [statusName, setStatusName] = useState([]);

  //グループ・ステータスデータ取得
  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from("tb_m_group")
        .select("id, group_name")
        .eq("delete_flag", 0);

        console.log(data)

      if (error) {
        console.error("Error fetching groups:", error);
      } else {
        setGroups(data);
      }
    };

    fetchGroups();
    

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("tb_m_status")
        .select("id, status_name")
        .eq("delete_flag", 0);

        console.log(data)

      if (error) {
        console.error("Error fetching status:", error);
      } else {
        setStatusName(data);
      }
    };

    fetchStatus();


  }, []);

  useEffect(() => {
    if (open) {
      setSelectedGroup(group_id);
      setSelectedStatus(status_id);
    }
  }, [open, group_id, status_id]);

  // グループ選択時の処理
  const handleChangeGroup = (event) => {
    const value = event.target.value;
    setSelectedGroup(value);
    setGroupId(value);
  };
  
  // ステータス選択時の処理
  const handleChangeStatus = (event) => {
    const value = event.target.value;
    setSelectedStatus(value);
    setStatusId(value);
  };

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
          <FormControl>
            <InputLabel htmlFor="component-outlined">名前</InputLabel>
            <OutlinedInput
            id="name"
            value={name}
            label="名前"
            onChange={(e) => setName(e.target.value)} 
            />
          </FormControl>
          <FormControl>
            <InputLabel htmlFor="component-outlined">メールアドレス</InputLabel>
            <OutlinedInput
            id="email"
            value={email}
            label="メールアドレス"
            onChange={(e) => setEmail(e.target.value)} 
            />
          </FormControl>
          <FormControl>
            <InputLabel htmlFor="component-outlined">パスワード</InputLabel>
            <OutlinedInput
            id="password"
            value={password}
            label="パスワード"
            onChange={(e) => setPassword(e.target.value)} 
            />
          </FormControl>
          <FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
              <DatePicker
                label="誕生日"
                id="birthday"
                value={birthday ? dayjs(birthday) : null}
                onChange={(newValue) => setBirthday(newValue?.format("YYYY-MM-DD"))} 
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl>
            <InputLabel id="group-select-label">グループ</InputLabel>
            <Select
              labelId="group-select-label"
              id="group_id"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setGroupId(e.target.value);
              }}
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.group_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="status-select-label">ステータス</InputLabel>
            <Select
              labelId="status-select-label"
              id="status_id"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setStatusId(e.target.value);
              }}
            >
              {statusName.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.status_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleRegister}>登録</Button>
      </DialogActions>
    </BootstrapDialog>
  )
}