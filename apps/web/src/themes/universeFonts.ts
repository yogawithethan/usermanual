import {
  Alegreya_Sans,
  Amaranth,
  Lexend_Deca,
  Lexend_Exa,
  Lobster,
  Quicksand,
} from "next/font/google";

const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wtfu-primary",
  display: "swap",
});

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-wtfu-secondary",
  display: "swap",
});

const amaranth = Amaranth({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-prana-primary",
  display: "swap",
});

const lexendExa = Lexend_Exa({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-yoga-reset-primary",
  display: "swap",
});

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-yoga-reset-secondary",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-gravity-primary",
  display: "swap",
});

export const universeFontClassName = [
  lobster.variable,
  alegreyaSans.variable,
  amaranth.variable,
  lexendExa.variable,
  lexendDeca.variable,
  quicksand.variable,
].join(" ");
