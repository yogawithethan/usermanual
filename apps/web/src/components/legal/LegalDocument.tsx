import Link from "next/link";
import type { ReactNode } from "react";

import { USER_MANUAL_SUPPORT_EMAIL } from "@/lib/legal";
import styles from "./LegalDocument.module.css";

export function LegalDocument({ children, title, version }: { children: ReactNode; title: string; version: string }) {
  return (
    <main className={`${styles.document} flex-1 px-5 py-10 sm:py-14`}>
      <article className={`${styles.paper} mx-auto w-full max-w-[760px] rounded-[28px] px-6 py-8 sm:px-10 sm:py-10`}>
        <Link className={`${styles.back} text-[14px] font-bold underline underline-offset-4`} href="/">Back to The User Manual</Link>
        <h1 className="mt-7 text-balance text-[38px] font-bold leading-[1.05] sm:text-[48px]">{title}</h1>
        <p className={`${styles.muted} mt-3 text-[13px] font-semibold uppercase tracking-[0.08em]`}>Effective {version}</p>
        <div className={`${styles.copy} mt-8 space-y-7 text-[16px] leading-7 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[23px] [&_h2]:font-bold [&_h2]:leading-tight [&_li]:ml-5 [&_li]:list-disc [&_p]:text-pretty`}>
          {children}
        </div>
        <p className={`${styles.muted} mt-9 border-t pt-6 text-[14px] leading-6`}>
          Questions? Email <a className="font-semibold underline underline-offset-4" href={`mailto:${USER_MANUAL_SUPPORT_EMAIL}`}>{USER_MANUAL_SUPPORT_EMAIL}</a>.
        </p>
      </article>
    </main>
  );
}
