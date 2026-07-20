import { ThemeProvider } from "@/themes/ThemeProvider";
import { dseTheme } from "@/themes/dse";
import { safeWelcomeNext } from "@/lib/welcome";
import { completeWelcome } from "./actions";
import {
  Button,
  ButtonLink,
  Eyebrow,
  Heading,
  Notice,
  Stack,
  Surface,
  Text,
} from "@/components/ui/System";

interface WelcomePageProps {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const params = await searchParams;
  const next = safeWelcomeNext(params.next);

  return (
    <ThemeProvider theme={dseTheme} className="flex-1">
      <main
        className="flex min-h-[100dvh] items-center justify-center px-5 py-10"
        style={{ background: "var(--theme-color-surface)" }}
      >
        <section className="w-full max-w-[720px]">
          <Surface padding="none" className="overflow-hidden">
          <div className="flex aspect-video items-center justify-center bg-theme-ink-strong px-6 text-white">
            <Notice tone="info" className="max-w-[420px] text-left">
              <strong>Welcome video coming soon.</strong><br />
              You can continue into the complete written sequence today.
            </Notice>
          </div>
          <div className="px-6 py-7 text-center md:px-10">
            <Eyebrow>The User Manual</Eyebrow>
            <Heading level={1} size="title" style={{ marginTop: "0.5rem" }}>Welcome</Heading>
            <Text className="mx-auto max-w-[560px]" style={{ marginTop: "1rem" }}>
              This free introduction is the beginning of your journey. Finish it
              here, then create or open your account to begin Level 1.
            </Text>
            {params.error ? (
              <Notice tone="error" className="mx-auto mt-5 max-w-[560px] text-left">{params.error}</Notice>
            ) : null}
            <Stack className="mt-7 sm:mx-auto sm:max-w-[420px]">
              <form action={completeWelcome} className="w-full">
                <input type="hidden" name="next" value={next} />
                <Button type="submit" size="large" fullWidth>
                  Finish welcome &amp; start Level 1
                </Button>
              </form>
              <ButtonLink
                href="/"
                transitionTypes={["nav-back"]}
                variant="secondary"
                size="large"
                fullWidth
              >
                Back to roadmap
              </ButtonLink>
            </Stack>
          </div>
          </Surface>
        </section>
      </main>
    </ThemeProvider>
  );
}
