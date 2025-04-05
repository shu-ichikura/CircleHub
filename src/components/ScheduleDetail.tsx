import React, { useEffect, useState } from "react";
import { getUserLoginId } from '../hooks/getUserLoginId.ts';
import { supabase } from '../lib/supabaseClient';

import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton"
import dayjs from "dayjs"; 
import utc from "dayjs/plugin/utc";

import Schedule from "./Schedule.tsx";

dayjs.extend(utc);

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

const ScheduleDetail = ({ open, onClose, event, selectedDate, getSchedules }) => {
    //出欠登録用状態管理
    const [userId, setUserId] = useState(null);
    const [isAttending, setIsAttending] = useState(false); // 参加済みフラグ
    const [isNotAttending, setIsNotAttending] = useState(false); // 不参加済みフラグ
    const [participants, setParticipants] = useState<string[]>([]); // 参加者リスト
    const [editModalOpen, setEditModalOpen] = useState(false);
    
    const formattedDate = dayjs.utc(event.schedule_date).format("YYYY/MM/DD HH:mm");

    useEffect(() => {
        if (open) {
        fetchUserId();
        }
    }, [open]);

    // ログイン中のユーザーID取得
    const fetchUserId = async () => {
        const id = await getUserLoginId();
        setUserId(id);
        checkAttendance(id);
        fetchParticipants();
    };

    // 出欠状況のチェック
    const checkAttendance = async (id) => {
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

    // 参加者リストの取得
    const fetchParticipants = async () => {
        const { data, error } = await supabase
        .from("tb_t_attendance")
        .select("user_id, tb_m_users(name)")
        .eq("schedule_id", event.id)
        .eq("attendance", 1)
        .order("created_at", { ascending: true });

        if (error) {
            console.error("参加者データの取得に失敗:", error.message);
            return;
        }
        console.log("取得した参加者データ:", data);

        const dataArray = Array.isArray(data) ? data : [data];
        setParticipants(dataArray.map((item) => item.tb_m_users.name));
    };

    // 参加ボタン押下処理
    const handleAttendance = async () => {
        if (!userId) return;

        // 既存の出欠データをチェック
        const { data, error } = await supabase
            .from("tb_t_attendance")
            .select("id")
            .eq("schedule_id", event.id)
            .eq("user_id", userId)
            .single(); // 1件のみ取得
    
        if (error && error.code !== "PGRST116") { // PGRST116 = "No rows found"
            console.error("エラーが発生しました:", error.message);
            return;
        }
    
        if (data) {
            // データが存在する場合は UPDATE
            const { error: updateError } = await supabase
                .from("tb_t_attendance")
                .update({
                    attendance: 1,
                    created_at: new Date().toISOString(), // 更新日時を記録
                })
                .eq("id", data.id);
    
            if (updateError) {
                console.error("更新に失敗しました:", updateError.message);
            } else {
                console.log("更新成功");
                setIsAttending(true);
                setIsNotAttending(false);
                fetchParticipants();
            }
        } else {
            // データが存在しない場合は INSERT
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
                fetchParticipants();
            }
        }
    }

    // 不参加ボタン押下処理
    const handleNonAttendance = async () => {
        if (!userId) return;

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
            // 既存データがある場合は UPDATE
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
                fetchParticipants();
            }
        } else {
            // 既存データがない場合は INSERT
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
                fetchParticipants();
            }
        }
    };

    //編集モーダル表示
    const handleOpenEditModal = () => {
        onClose();
        setEditModalOpen(true);
    };
    
    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    return (
        <>
            <BootstrapDialog
                onClose={onClose}
                open={open}
                fullWidth
                maxWidth="md"
                sx={{ 
                    "& .MuiDialog-paper": { 
                        width: "90%", 
                        maxWidth: 600, 
                        margin: "auto" // ← 中央に配置
                    } 
                }}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="flex-end">
                        <IconButton onClick={handleOpenEditModal}>
                            <SettingsIcon sx={{ color: "gray", cursor: "pointer" }} />
                        </IconButton>
                        <IconButton>
                            <DeleteIcon sx={{ color: "gray", cursor: "pointer" }} />
                        </IconButton>
                    </Box>
                    <Box mt={1}>
                        <span>スケジュール詳細</span>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <strong>日時：</strong> {formattedDate}
                </DialogContent>
                <DialogContent>
                    <strong>練習場所：</strong> {event.schedule_place}
                </DialogContent>
                <DialogContent>
                    <strong>内容：</strong> {event.schedule_content}
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
            </BootstrapDialog>
            <Schedule 
                open={editModalOpen} 
                onClose={handleCloseEditModal} 
                isEditMode={true}
                event={event} 
                getSchedules={getSchedules}
                selectedDate={selectedDate}
            />
        </>
    )
}

export default ScheduleDetail