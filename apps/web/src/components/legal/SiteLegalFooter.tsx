import Link from "next/link";

import { USER_MANUAL_SUPPORT_EMAIL } from "@/lib/legal";
import styles from "./SiteLegalFooter.module.css";

export function SiteLegalFooter() {
  return (
    <footer className={`${styles.footer} relative z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-5 py-5 text-center text-[12px] font-semibold backdrop-blur-sm`}>
      <span>© {new Date().getFullYear()} Ethan Hill LLC · Yoga With Ethan</span>
      <Link href="/terms">Terms</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/refunds">Refunds</Link>
      <a href={`mailto:${USER_MANUAL_SUPPORT_EMAIL}`}>Support</a>
    </footer>
  );
}
