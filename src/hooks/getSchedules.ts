import { useState, useEffect } from "react";
import { supabase } from './supabaseClient';
import { getUserLoginId } from "./getUserLoginId";

export const useGetSchedules = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true);
            try {
                // スケジュールデータ取得
                const { data, error } = await supabase.from("tb_t_schedule").select("*");

                if (error) throw new Error("スケジュールの取得に失敗しました: " + error.message);

                // ログインユーザーID取得
                const id = await getUserLoginId();
                setUserId(id);

                // スケジュールを時刻順にソート
                const sortedData = data.sort(
                    (a, b) => Date.parse(a.schedule_date) - Date.parse(b.schedule_date)
                );

                // データをカレンダーのイベント形式に変換
                const formattedEvents = await Promise.all(
                    sortedData.map(async (item) => {
                        const attendance = await checkAttendance(id, item.id);
                        return {
                            id: item.id,
                            title: `${item.schedule_content} @ ${item.schedule_place}`,
                            date: item.schedule_date.split("T")[0], // 日付部分のみ取得
                            fullData: item,
                            attendance: attendance
                        };
                    })
                );

                setEvents(formattedEvents);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    return { events, userId, loading };
};

// 出欠状況のチェック
const checkAttendance = async (userId: string, scheduleId: number) => {
    const { data, error } = await supabase
        .from("tb_t_attendance")
        .select("attendance")
        .eq("user_id", userId)
        .eq("schedule_id", scheduleId)
        .single();

    if (error) {
        console.error("出欠データの取得に失敗:", error.message);
        return null;
    }
    return data ? data.attendance : null;
};
