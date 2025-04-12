import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Schedule from "./components/Schedule";
import { supabase } from "./lib/supabaseClient";
import { getUserLoginId } from './hooks/getUserLoginId.ts';

const thisMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const Calender = () => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const getSchedules = async () => {
    const { data, error } = await supabase.from("tb_t_schedule").select("*");

    if (error) {
      console.error("スケジュールの取得に失敗しました:", error.message);
    } else {
      const id = await getUserLoginId();
      const sortedData = data.sort((a, b) => Date.parse(a.schedule_date) - Date.parse(b.schedule_date));
      const formattedEvents = await Promise.all(sortedData.map(async (item) => {
        const attendance = await checkAttendance(id, item.id);
        return {
          id: item.id,
          title: `${item.schedule_content} @ ${item.schedule_place}`,
          date: item.schedule_date.split("T")[0],
          fullData: item,
          attendance: attendance
        };
      }));
      setEvents(formattedEvents);
    }
  };

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

  useEffect(() => {
    getSchedules();
  }, []);

  return (
    <div className="bg-white text-black p-4 rounded shadow">
      <FullCalendar 
        plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" 
        events={events}
        dateClick={(arg) => {
          setSelectedDate(arg.dateStr);
          setIsEditMode(true);
          setSelectedEvent(null);
          setScheduleOpen(true);
        }}
        eventClick={(arg) => {
          setSelectedEvent(arg.event.extendedProps.fullData);
          setSelectedDate(arg.event.start ? arg.event.start.toLocaleDateString("sv-SE") : null);
          setIsEditMode(false);
          setScheduleOpen(true);
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
      {scheduleOpen && (
        <Schedule 
          open={scheduleOpen} 
          onClose={() => setScheduleOpen(false)} 
          selectedDate={selectedDate} 
          getSchedules={getSchedules} 
          isEditMode={isEditMode} 
          event={selectedEvent} 
        />
      )}
    </div>
  );
};

export default Calender;