import dayjs from "dayjs";
import React from "react";
import type { EventJSON } from "~/data/Event";

export const OrigEventUI = ({ event }: { event: EventJSON }) => {
  const [startTimeStr, endTimeStr] = [event.startTime, event.endTime].map(t => dayjs(t).format("h:mmA"));
  return (
    <li
      style={{ padding: "8px 0" }}
      key={event.id}>
      <div style={{ width: "6%", color: "000000" }}>
        <strong>{dayjs(event.startTime).format("M/D/YYYY")}</strong>
      </div>
      <ul style={{ listStyle: "none", paddingInlineStart: 0 }}>
        <li style={{ width: "25%" }}>
          {startTimeStr}-{endTimeStr}
        </li>
        <li>{event.location}</li>
      </ul>
      {event.description && (
        <div>
          <span>
            <span
              style={{
                color: "#00f",
                fontStyle: "italic",
                fontSize: "12px",
                fontWeight: "bold",
                whiteSpace: "pre-wrap"
              }}
            >
              {event.description}
            </span>
          </span>
        </div>
      )}
    </li>
  );
};
