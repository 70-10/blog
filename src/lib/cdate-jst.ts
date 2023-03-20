import { cdate } from "cdate";

export const cdateJST = cdate().tz("Asia/Tokyo").cdateFn();
