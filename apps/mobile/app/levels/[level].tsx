import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  createLessonComment,
  createNote,
  fetchLessonComments,
  fetchUserManualSync,
  patchLevelProgress,
} from "@/api/userManual";
import { AccessBanner } from "@/components/AccessBanner";
import type { LessonCommentsPayload, TutorialLevelManifest, UserManualSyncPayload } from "@/content/types";
import { levelStatus, loadUserManualData } from "@/state/userManual";
import { writeSyncCache } from "@/storage/cache";
import { enqueueOutboxItem } from "@/storage/outbox";

export default function LevelDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ level: string }>();
  const levelNumber = Number(params.level);
  const [level, setLevel] = useState<TutorialLevelManifest | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sync, setSync] = useState<UserManualSyncPayload | null>(null);
  const [comments, setComments] = useState<LessonCommentsPayload["comments"]>([]);
  const [noteText, setNoteText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await loadUserManualData();
      const nextLevel = data.manifest.levels.find((item) => item.levelNumber === levelNumber);

      if (!nextLevel) {
        throw new Error("Level not found.");
      }

      const commentPayload = await fetchLessonComments(levelNumber, {
        accessToken: data.session?.accessToken,
      });

      if (!mounted) return;

      setAccessToken(data.session?.accessToken ?? null);
      setSync(data.sync);
      setLevel(nextLevel);
      setComments(commentPayload.comments);
    }

    load().catch((nextError: unknown) => {
      if (mounted) {
        setError(nextError instanceof Error ? nextError.message : "Could not load this level.");
      }
    });

    return () => {
      mounted = false;
    };
  }, [levelNumber]);

  async function markComplete() {
    if (!accessToken || !level) {
      setError("Sign in with Islands before starting the free tutorial.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await patchLevelProgress(accessToken, {
        levelNumber: level.levelNumber,
        status: "completed",
      });
      const nextSync = await fetchUserManualSync({ accessToken });
      if (nextSync.value) {
        await writeSyncCache(accessToken, nextSync.value, nextSync.etag);
        setSync(nextSync.value);
      }
    } catch (nextError: unknown) {
      await enqueueOutboxItem({
        body: {
          levelNumber: level.levelNumber,
          status: "completed",
        },
        type: "level-progress",
      });
      setError("Progress could not sync now. It was saved for retry.");
    } finally {
      setBusy(false);
    }
  }

  async function saveNote() {
    if (!accessToken || !level) {
      setError("Sign in with Islands before saving notes.");
      return;
    }

    const body = noteText.trim();
    if (!body) return;

    setBusy(true);
    setError(null);

    try {
      await createNote(accessToken, {
        body,
        tutorialLevel: level.levelNumber,
      });
      const nextSync = await fetchUserManualSync({ accessToken });
      if (nextSync.value) {
        await writeSyncCache(accessToken, nextSync.value, nextSync.etag);
        setSync(nextSync.value);
      }
      setNoteText("");
    } catch (nextError: unknown) {
      await enqueueOutboxItem({
        body: {
          body,
          tutorialLevel: level.levelNumber,
        },
        type: "note",
      });
      setNoteText("");
      setError("Note could not sync now. It was saved for retry.");
    } finally {
      setBusy(false);
    }
  }

  async function postComment() {
    if (!accessToken || !level) {
      setError("Sign in with Islands before asking a question.");
      return;
    }

    const body = commentText.trim();
    if (!body) return;

    setBusy(true);
    setError(null);

    try {
      await createLessonComment(accessToken, level.levelNumber, { body });
      const payload = await fetchLessonComments(level.levelNumber, { accessToken });
      setComments(payload.comments);
      setCommentText("");
    } catch (nextError: unknown) {
      await enqueueOutboxItem({
        body: {
          body,
          levelNumber: level.levelNumber,
        },
        type: "lesson-comment",
      });
      setCommentText("");
      setError("Question could not sync now. It was saved for retry.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !level) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!level) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const status = levelStatus(sync, level.levelNumber);
  const signedIn = Boolean(accessToken);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Level {level.levelNumber}</Text>
        <Text style={styles.title}>{level.hero ?? level.title}</Text>
        <Text style={styles.subtitle}>{level.subtitle}</Text>
        <Text style={styles.status}>{status.replace("_", " ")}</Text>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <View style={styles.accessWrap}>
        <AccessBanner
          body={
            signedIn
              ? "Notes, public questions, checklist progress, and sync are active for this account."
              : "The welcome video is public. Sign in with Islands before starting the free tutorial or saving progress."
          }
          title={signedIn ? "Progress sync active" : "Sign-in required"}
          tone={signedIn ? "unlocked" : "signed-in"}
        />
      </View>

      <View style={styles.section}>
        {level.sections.map((section) => (
          <View key={section.id} style={styles.block}>
            <Text style={styles.blockTitle}>{section.title}</Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text key={`${section.id}-${index}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {level.checklist.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mastery Checklist</Text>
          {level.checklist.map((item) => (
            <View key={item.id} style={styles.checkRow}>
              <Text style={styles.check}>{item.isCompleteByDefault ? "✓" : "○"}</Text>
              <Text style={styles.checkText}>{item.body}</Text>
            </View>
          ))}
          <Pressable
            disabled={busy}
            onPress={markComplete}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
          >
            <Text style={styles.primaryButtonText}>{busy ? "Saving..." : "Mark Level Complete"}</Text>
          </Pressable>
        </View>
      ) : null}

      {level.faqs.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {level.faqs.map((faq) => (
            <View key={faq.id} style={styles.block}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.paragraph}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Private Notes</Text>
        <TextInput
          multiline
          onChangeText={setNoteText}
          placeholder="Write a private note..."
          placeholderTextColor="#7B8C9D"
          style={styles.input}
          value={noteText}
        />
        <Pressable
          disabled={busy || !noteText.trim()}
          onPress={saveNote}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
        >
          <Text style={styles.secondaryButtonText}>Save Note</Text>
        </Pressable>
        {sync?.userContent.notes
          .filter((note) => note.tutorial_level === level.levelNumber)
          .slice(0, 3)
          .map((note) => (
            <View key={note.id} style={styles.comment}>
              <Text style={styles.paragraph}>{note.body}</Text>
            </View>
          ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <TextInput
          multiline
          onChangeText={setCommentText}
          placeholder="Ask a public question..."
          placeholderTextColor="#7B8C9D"
          style={styles.input}
          value={commentText}
        />
        <Pressable
          disabled={busy || !commentText.trim()}
          onPress={postComment}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
        >
          <Text style={styles.secondaryButtonText}>Post Question</Text>
        </Pressable>
        {comments.length ? (
          comments.slice(0, 5).map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.paragraph}>{comment.body}</Text>
              {(comment.answers ?? comment.lesson_answers ?? []).map((answer) => (
                <Text key={answer.id} style={styles.answer}>
                  Teacher: {answer.body}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.paragraph}>No public questions yet.</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  answer: {
    color: "#1E68B6",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  block: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
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
  check: {
    color: "#1E68B6",
    fontSize: 18,
    fontWeight: "900",
    width: 24,
  },
  checkRow: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 14,
  },
  checkText: {
    color: "#26384B",
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  comment: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  disabled: {
    opacity: 0.56,
  },
  error: {
    color: "#9F1D2F",
    fontSize: 16,
    textAlign: "center",
  },
  eyebrow: {
    color: "#5F6F82",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  footer: {
    padding: 20,
    paddingTop: 4,
  },
  hero: {
    gap: 8,
    padding: 20,
  },
  inlineError: {
    color: "#9F1D2F",
    fontSize: 14,
    marginHorizontal: 20,
  },
  accessWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    color: "#142131",
    fontSize: 15,
    lineHeight: 22,
    minHeight: 96,
    padding: 14,
    textAlignVertical: "top",
  },
  paragraph: {
    color: "#3B4B5F",
    fontSize: 15,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.82,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#142131",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  question: {
    color: "#142131",
    fontSize: 16,
    fontWeight: "900",
  },
  screen: {
    backgroundColor: "#F7F1EA",
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#9FB0C0",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButtonText: {
    color: "#142131",
    fontSize: 15,
    fontWeight: "800",
  },
  section: {
    gap: 10,
    padding: 20,
    paddingTop: 4,
  },
  sectionTitle: {
    color: "#142131",
    fontSize: 18,
    fontWeight: "900",
  },
  status: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4ED",
    borderRadius: 8,
    borderWidth: 1,
    color: "#1E68B6",
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "capitalize",
  },
  subtitle: {
    color: "#3B4B5F",
    fontSize: 18,
    lineHeight: 24,
    textTransform: "capitalize",
  },
  title: {
    color: "#142131",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
