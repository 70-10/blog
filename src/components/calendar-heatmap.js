import React from "react";
import dayjs from "dayjs";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import style from "./calendar-heatmap.module.css";

export default ({ values }) => (
  <CalendarHeatmap
    startDate={dayjs()
      .subtract(1, "year")
      .toDate()}
    endDate={dayjs().toDate()}
    values={values}
    classForValue={value => {
      if (!value || !value.count || value.count <= 0) {
        return style.colorEmpty;
      }
      if (value.count > 20000) {
        return style.colorScale4;
      }
      if (value.count > 10000) {
        return style.colorScale3;
      }
      if (value.count > 5000) {
        return style.colorScale2;
      }
      return style.colorScale1;
    }}
  />
);
