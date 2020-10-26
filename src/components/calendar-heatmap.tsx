import React, { FC } from "react";
import moment from "../moment";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import style from "./calendar-heatmap.module.css";

const Component: FC = ({ values }) => (
  <CalendarHeatmap
    startDate={moment().subtract(1, "year").toDate()}
    endDate={moment().toDate()}
    values={values}
    classForValue={(value) => {
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

export default Component;
