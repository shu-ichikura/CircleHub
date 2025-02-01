import React from 'react'
import { useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // pluginは、あとから
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";

const thisMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const Calender = () => {
  const handleDateClick = useCallback((arg: DateClickArg) => {
    alert(arg.dateStr);
  }, []);

  return (
    <div className="bg-white text-black p-4 rounded shadow">
      <FullCalendar 
        plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" 
        events={[
          { title: "event 1", date: `${thisMonth()}-01` },
          { title: "event 2", date: `${thisMonth()}-02` },
        ]}
        dateClick={handleDateClick}
      />
    </div>
  )
}

export default Calender