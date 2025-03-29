import React from 'react'
import { useState,useEffect } from 'react';
import { getUserLoginId } from './hooks/getUserLoginId.ts';

//supabaseAPI接続用
import { supabase } from './hooks/supabaseClient';

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
import dayjs from "dayjs"; 
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// モーダルのスタイル設定
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

type EventType = {
  id: number;
  schedule_place: string;
  schedule_content: string;
  schedule_date: string;
};

type ScheduleProps = {
  open: boolean;
  onClose: () => void;
  selectedDate: string;
  getSchedules: () => void;
  isEditMode?: boolean;
  event?: EventType | null; // event は null になる可能性があるので明示
};

const Schedule: React.FC<ScheduleProps> = ({ open, onClose, selectedDate, getSchedules, isEditMode = false, event = null }) => {
  //入力フォーム状態管理
  const [schedulePlace, setSchedulePlace] = useState('')
  const [scheduleContent, setScheduleContent] = useState('')
  const [scheduleTime, setScheduleTime] = useState("12:00")

  useEffect(() => {
    if (isEditMode && event) {
      setSchedulePlace(event.schedule_place);
      setScheduleContent(event.schedule_content);
      setScheduleTime(dayjs.utc(event.schedule_date).format("HH:mm"));
    }
  }, [isEditMode, event]);

  // 登録・更新
  const handleSave = async () => {
    const userId = await getUserLoginId();
    const scheduleDateTime = `${selectedDate}T${scheduleTime}:00`;

    if (isEditMode && event) {
      // 更新処理 (UPDATE)
      const { error } = await supabase
        .from("tb_t_schedule")
        .update({
          schedule_date: scheduleDateTime,
          schedule_place: schedulePlace,
          schedule_content: scheduleContent,
        })
        .eq("id", event.id);

      if (error) {
        console.error("更新に失敗しました:", error.message);
      } else {
        console.log("更新成功");
        getSchedules();
        onClose();
      }
    } else {
      // 新規登録 (INSERT)
      const { error } = await supabase.from("tb_t_schedule").insert([
        {
          schedule_date: scheduleDateTime,
          schedule_place: schedulePlace,
          schedule_content: scheduleContent,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("登録に失敗しました:", error.message);
      } else {
        console.log("登録成功");
        getSchedules();
        onClose();
      }
    }
  };

  return (
    <BootstrapDialog open={open}>
      <DialogTitle>スケジュール {isEditMode ? "編集" : "作成"}</DialogTitle>
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
        <Typography>選択した日付: {selectedDate}</Typography>
        <Box component="form" sx={{ "& > :not(style)": { m: 1, width: "60ch" } }} noValidate autoComplete="off">
          <TextField
            id="schedule_time"
            label="時刻"
            type="time"
            fullWidth
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            InputLabelProps={{
              shrink: true, // ラベルを小さくして常に表示
            }}
          />
          <Typography gutterBottom>
            <TextField 
              id="schedule_place" 
              label="練習場所" 
              variant="outlined" 
              fullWidth
              value={schedulePlace}
              onChange={(e) => setSchedulePlace(e.target.value)}
            />
          </Typography>
          <Typography gutterBottom>
            <TextField 
              id="schedule_content" 
              label="内容" 
              variant="outlined" 
              fullWidth
              value={scheduleContent}
              onChange={(e) => setScheduleContent(e.target.value)}
            />
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} color="primary">
          {isEditMode ? "更新" : "登録"}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  )
}

export default Schedule;