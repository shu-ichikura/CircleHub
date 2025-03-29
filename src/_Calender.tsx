import React from 'react'
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // pluginは、あとから
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import Schedule from './Schedule';
import ScheduleDetail from "./ScheduleDetail";
import { supabase } from "./hooks/supabaseClient";
import { getUserLoginId } from './hooks/getUserLoginId.ts';
//import { useGetSchedules } from './hooks/getSchedules.ts';

const thisMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const Calender = () => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userId, setUserId] = useState(null);

  //スケジュールデータを取得
  const getSchedules = async () => {
    const { data, error } = await supabase.from("tb_t_schedule").select("*");

    if (error) {
      console.error("スケジュールの取得に失敗しました:", error.message);
    } else {
      // ログイン中のユーザーID取得
      const id = await getUserLoginId();
      setUserId(id);

      // スケジュールを時刻順にソート（Dateオブジェクトで比較）
      const sortedData = data.sort((a, b) => Date.parse(a.schedule_date) - Date.parse(b.schedule_date));

      // データをカレンダーのイベント形式に変換
      const formattedEvents = await Promise.all(sortedData.map(async (item) => {
        const attendance = await checkAttendance(id, item.id);
        return {
          id: item.id,
          title: `${item.schedule_content} @ ${item.schedule_place}`,
          date: item.schedule_date.split("T")[0], // 日付部分のみ取得
          fullData: item,
          attendance: attendance
        };
      }));
      setEvents(formattedEvents);
    }
  };

  // 出欠状況のチェック
  const checkAttendance = async (userId, scheduleId) => {
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

  //初回読み込み時にデータ取得
  useEffect(() => {
    getSchedules();
  }, []);

  //const { events, loading } = useGetSchedules();

  return (
    <div className="bg-white text-black p-4 rounded shadow">
      <FullCalendar 
        plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" 
        events={events}
        dateClick={(arg) => {
          setSelectedDate(arg.dateStr);
          setScheduleOpen(true);
        }}
        eventClick={(arg) => {
          setSelectedEvent(arg.event.extendedProps.fullData);
          setSelectedDate(arg.event.start ? arg.event.start.toLocaleDateString("sv-SE") : null);
          setDetailOpen(true);
        }}
        eventContent={(arg) => {
          const attendance = arg.event.extendedProps.attendance;
          let style = { 
            whiteSpace: "normal", 
            wordWrap: "break-word", 
            padding: "2px" 
          };
        
          if (attendance === 2) {
            style = { ...style, backgroundColor: "white", color: "#3788d8", textDecoration: "line-through" };
          } else if (attendance === null) {
            style = { ...style, backgroundColor: "white", color: "#3788d8" };
          }
        
          return (
            <div style={style}>
              {arg.event.title}
            </div>
          );
        }}
      />
      {/* スケジュール登録モーダル */}
      {scheduleOpen && (
        <Schedule open={scheduleOpen} onClose={() => setScheduleOpen(false)} selectedDate={selectedDate} getSchedules={getSchedules}/>
      )}

      {/* スケジュール詳細モーダル */}
      {detailOpen && selectedEvent && (
        <ScheduleDetail open={detailOpen} onClose={() => setDetailOpen(false)} event={selectedEvent} selectedDate={selectedDate} getSchedules={getSchedules}/>
      )}
    </div>
  )
}

export default Calender