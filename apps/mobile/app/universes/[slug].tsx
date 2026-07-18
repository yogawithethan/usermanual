import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { UniverseMark } from "@/components/UniverseMark";
import type { PracticeUniverseManifest } from "@/content/types";
import { loadUserManualData } from "@/state/userManual";
import { universeThemes } from "@/theme/universes";

export default function UniverseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = String(params.slug || "");
  const [universe, setUniverse] = useState<PracticeUniverseManifest | null>(null);
  const [entitled, setEntitled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadUserManualData()
      .then((data) => {
        const nextUniverse = data.manifest.practiceUniverses.find((item) => item.slug === slug);
        if (!nextUniverse) throw new Error("Side quest not found.");
        if (!mounted) return;
        setUniverse(nextUniverse);
        setEntitled(Boolean(data.sync?.access.entitled ?? data.manifest.access.entitled));
      })
      .catch((nextError: unknown) => {
        if (mounted) {
          setError(nextError instanceof Error ? nextError.message : "Could not load this side quest.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!universe) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const theme = universeThemes[universe.slug] ?? universeThemes.default;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.screen, { backgroundColor: theme.surface }]}
    >
      <View style={[styles.hero, { borderColor: theme.accent }]}>
        <View style={styles.heroTop}>
          <UniverseMark
            backgroundColor={theme.badgeBackground}
            color={theme.badgeInk}
            mark={theme.mark}
            size={58}
          />
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.ink, fontFamily: theme.bodyFont }]}>Side Quest</Text>
            <Text style={[styles.mood, { color: theme.ink, fontFamily: theme.bodyFont }]}>{theme.mood}</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: theme.ink, fontFamily: theme.headingFont }]}>{universe.name}</Text>
        <Text style={[styles.subtitle, { color: theme.ink, fontFamily: theme.bodyFont }]}>{universe.tagline}</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.status, { borderColor: theme.accent, color: theme.ink, fontFamily: theme.bodyFont }]}>
            {universe.isAvailable ? "Unlocked by progress" : `Unlocks after Level ${universe.unlockLevel}`}
          </Text>
          <Text style={[styles.status, { borderColor: theme.accentSoft, color: theme.ink, fontFamily: theme.bodyFont }]}>
            {universe.practices.length} practices
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        {universe.sections.map((section) => (
          <View key={section.id} style={styles.block}>
            <Text style={[styles.blockTitle, { fontFamily: theme.headingFont }]}>{section.title}</Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text key={`${section.id}-${index}`} style={[styles.paragraph, { fontFamily: theme.bodyFont }]}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Practices</Text>
        {universe.practices.length ? (
          universe.practices.map((practice) => (
            <Pressable
              key={practice.id}
              onPress={() => router.push(`/practices/${practice.id}`)}
              style={({ pressed }) => [
                styles.practiceRow,
                {
                  borderColor: practice.isAvailable ? theme.accentSoft : "#E4B8B8",
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.practiceText}>
                <Text style={[styles.practiceTitle, { fontFamily: theme.bodyFont }]}>{practice.title}</Text>
                <Text style={[styles.practiceMeta, { fontFamily: theme.bodyFont }]}>
                  {practice.durationMinutes ? `${practice.durationMinutes} min · ` : ""}
                  {practice.kind}
                </Text>
              </View>
              <View
                style={[
                  styles.practicePill,
                  {
                    backgroundColor: practice.isAvailable && entitled ? theme.accent : "#FFFFFF",
                    borderColor: practice.isAvailable && entitled ? theme.accent : "#CFA8A8",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.practiceState,
                    {
                      color: practice.isAvailable && entitled ? "#FFFFFF" : theme.ink,
                      fontFamily: theme.bodyFont,
                    },
                  ]}
                >
                  {practice.isAvailable && entitled ? "Play" : practice.isPaid ? "Paid" : "Locked"}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={[styles.paragraph, { fontFamily: theme.bodyFont }]}>
            Practice videos will appear here once published.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    gap: 8,
    padding: 16,
  },
  blockTitle: {
    color: "#142131",
    fontSize: 19,
    fontWeight: "900",
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  error: {
    color: "#9F1D2F",
    fontSize: 16,
    textAlign: "center",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  hero: {
    borderBottomWidth: 2,
    gap: 10,
    padding: 20,
  },
  heroCopy: {
    flex: 1,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  mood: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
    opacity: 0.78,
  },
  paragraph: {
    color: "#3B4B5F",
    fontSize: 15,
    lineHeight: 22,
  },
  practiceMeta: {
    color: "#5F6F82",
    fontSize: 14,
    marginTop: 2,
    textTransform: "capitalize",
  },
  practiceRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 74,
    padding: 16,
  },
  practiceState: {
    fontSize: 13,
    fontWeight: "900",
  },
  practicePill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  practiceText: {
    flex: 1,
    paddingRight: 12,
  },
  practiceTitle: {
    color: "#142131",
    fontSize: 16,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.78,
  },
  screen: {
    flex: 1,
  },
  section: {
    gap: 10,
    padding: 20,
  },
  sectionTitle: {
    color: "#142131",
    fontSize: 18,
    fontWeight: "900",
  },
  status: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "capitalize",
  },
});
