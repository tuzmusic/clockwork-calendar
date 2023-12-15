import { createCookie } from "@remix-run/node";

export const googleTokensCookie = createCookie("google-tokens");
export const selectedCalendarCookie = createCookie("selected-calendar");
export const markupEventsCookie = createCookie("markup-events");
