import { Cormorant_Garamond, Poppins } from "next/font/google";

/** Neutral typography for navigation, forms, settings, tabs, and filters. */
const appDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-app-display",
  display: "swap",
});

const appUi = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-app-ui",
  display: "swap",
});

export const appChromeFontClassName = `${appDisplay.variable} ${appUi.variable}`;
