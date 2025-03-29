import React, { useState, useEffect } from 'react';
import { getUserLoginId } from './hooks/getUserLoginId.ts';
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
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";

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
  event?: EventType | null;
};

const Schedule: React.FC<ScheduleProps> = ({ open, onClose, selectedDate, getSchedules, isEditMode = false, event = null }) => {
  const [schedulePlace, setSchedulePlace] = useState('');
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [userId, setUserId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isAttending, setIsAttending] = useState(false);
  const [isNotAttending, setIsNotAttending] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (isEditMode && event) {
        setSchedulePlace(event.schedule_place);
        setScheduleContent(event.schedule_content);
        setScheduleTime(dayjs(event.schedule_date).format("HH:mm"));
      } else if (!isEditMode && event) {
        fetchParticipants(event.id);
      }
  }, [isEditMode, event]);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserLoginId();
      setUserId(id);
      if (!isEditMode && event) {
        checkAttendance(id);
      }
    };
    fetchUserId();
  }, [isEditMode, event]);

  const handleSave = async () => {
    const scheduleDateTime = `${selectedDate}T${scheduleTime}:00`;

    if (isEditMode && event) {
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
        await getSchedules();
        onClose();
      }
    } else {
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

  const fetchParticipants = async (scheduleId: number) => {
    const { data, error } = await supabase
      .from("tb_t_attendance")
      .select("user_id, tb_m_users(name)")
      .eq("schedule_id", scheduleId)
      .eq("attendance", 1)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("参加者データの取得に失敗:", error.message);
      return;
    }

    const dataArray = Array.isArray(data) ? data : [data];
    setParticipants(dataArray.map((item) => item.tb_m_users.name));
  };

  //出欠状況のチェック
  const checkAttendance = async (id: string) => {
    const { data, error } = await supabase
      .from("tb_t_attendance")
      .select("attendance")
      .eq("user_id", id)
      .eq("schedule_id", event.id);

    if (error) {
      console.error("出欠データの取得に失敗:", error.message);
      return;
    }

    if (data.length > 0) {
      const attendanceStatus = data[0].attendance;
      setIsAttending(attendanceStatus === 1);
      setIsNotAttending(attendanceStatus === 2);
    }
  };

  const handleAttendance = async () => {
    if (!userId || !event) return;

    const { data, error } = await supabase
      .from("tb_t_attendance")
      .select("id")
      .eq("schedule_id", event.id)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("エラーが発生しました:", error.message);
      return;
    }

    if (data) {
      const { error: updateError } = await supabase
        .from("tb_t_attendance")
        .update({
          attendance: 1,
          created_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (updateError) {
        console.error("更新に失敗しました:", updateError.message);
      } else {
        console.log("更新成功");
        setIsAttending(true);
        setIsNotAttending(false);
        fetchParticipants(event.id);
      }
    } else {
      const { error: insertError } = await supabase.from("tb_t_attendance").insert([
        {
          schedule_id: event.id,
          user_id: userId,
          attendance: 1,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("登録に失敗しました:", insertError.message);
      } else {
        console.log("登録成功");
        setIsAttending(true);
        setIsNotAttending(false);
        fetchParticipants(event.id);
      }
    }
  };

  const handleNonAttendance = async () => {
    if (!userId || !event) return;

    const { data, error } = await supabase
      .from("tb_t_attendance")
      .select("id")
      .eq("schedule_id", event.id)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("エラーが発生しました:", error.message);
      return;
    }

    if (data) {
      const { error: updateError } = await supabase
        .from("tb_t_attendance")
        .update({
          attendance: 2,
          created_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (updateError) {
        console.error("更新に失敗しました:", updateError.message);
      } else {
        console.log("更新成功");
        setIsAttending(false);
        setIsNotAttending(true);
        fetchParticipants(event.id);
      }
    } else {
      const { error: insertError } = await supabase.from("tb_t_attendance").insert([
        {
          schedule_id: event.id,
          user_id: userId,
          attendance: 2,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("登録に失敗しました:", insertError.message);
      } else {
        console.log("登録成功");
        setIsAttending(false);
        setIsNotAttending(true);
        fetchParticipants(event.id);
      }
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    const { error: deleteAttendanceError } = await supabase
      .from("tb_t_attendance")
      .delete()
      .eq("schedule_id", event.id);

    if (deleteAttendanceError) {
      console.error("出欠データの削除に失敗しました:", deleteAttendanceError.message);
      return;
    }

    const { error: deleteScheduleError } = await supabase
      .from("tb_t_schedule")
      .delete()
      .eq("id", event.id);

    if (deleteScheduleError) {
      console.error("スケジュールの削除に失敗しました:", deleteScheduleError.message);
      return;
    }

    console.log("削除成功");
    getSchedules();
    onClose();
  };

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    getSchedules(); // 更新後のデータを取得
  };

  return (
    <>
      <BootstrapDialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between">
            <span>スケジュール {isEditMode ? "編集" : "詳細"}</span>
            <Box display="flex" justifyContent="flex-end">
              {!isEditMode && (
                <>
                  <IconButton onClick={handleOpenEditModal}>
                    <SettingsIcon sx={{ color: "gray", cursor: "pointer" }} />
                  </IconButton>
                  <IconButton onClick={handleDelete}>
                    <DeleteIcon sx={{ color: "gray", cursor: "pointer" }} />
                  </IconButton>
                </>
              )}
              <IconButton aria-label="close" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography>選択した日付: {selectedDate}</Typography>
          {isEditMode ? (
            <Box component="form" sx={{ "& > :not(style)": { m: 1, width: "60ch" } }} noValidate autoComplete="off">
              <TextField
                id="schedule_time"
                label="時刻"
                type="time"
                fullWidth
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                id="schedule_place"
                label="練習場所"
                variant="outlined"
                fullWidth
                value={schedulePlace}
                onChange={(e) => setSchedulePlace(e.target.value)}
              />
              <TextField
                id="schedule_content"
                label="内容"
                variant="outlined"
                fullWidth
                value={scheduleContent}
                onChange={(e) => setScheduleContent(e.target.value)}
              />
            </Box>
          ) : (
            <>
              <DialogContent>
                <strong>日時：</strong> {dayjs(event?.schedule_date).format("YYYY/MM/DD HH:mm")}
              </DialogContent>
              <DialogContent>
                <strong>練習場所：</strong> {event?.schedule_place}
              </DialogContent>
              <DialogContent>
                <strong>内容：</strong> {event?.schedule_content}
              </DialogContent>
              <DialogContent>
                <strong>参加者：</strong> {participants.length > 0 ? participants.join(", ") : "なし"}
              </DialogContent>
              <DialogActions sx={{ borderTop: "1px solid #ddd", backgroundColor: "#f7f7f7" }}>
                <Button color="primary" onClick={handleAttendance} disabled={isAttending}>
                  参加
                </Button>
                <Button color="primary" onClick={handleNonAttendance} disabled={isNotAttending}>
                  不参加
                </Button>
              </DialogActions>
            </>
          )}
        </DialogContent>
        {isEditMode && (
          <DialogActions>
            <Button onClick={onClose}>キャンセル</Button>
            <Button onClick={handleSave} color="primary">
              {isEditMode ? "更新" : "登録"}
            </Button>
          </DialogActions>
        )}
      </BootstrapDialog>
      {editModalOpen && (
        <Schedule
          open={editModalOpen}
          onClose={onClose}
          isEditMode={true}
          event={event}
          getSchedules={getSchedules}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
};

export default Schedule;