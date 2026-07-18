import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AccessTone = "locked" | "paid" | "signed-in" | "unlocked";

const toneConfig = {
  locked: {
    background: "#FFF4F4",
    border: "#E4B8B8",
    icon: LockKeyhole,
    iconColor: "#9F1D2F",
  },
  paid: {
    background: "#FFF8D7",
    border: "#F4BC33",
    icon: LockKeyhole,
    iconColor: "#9B6900",
  },
  "signed-in": {
    background: "#EDF4FF",
    border: "#9FC1E6",
    icon: UserRound,
    iconColor: "#1E68B6",
  },
  unlocked: {
    background: "#EEF9F4",
    border: "#9AD7BA",
    icon: ShieldCheck,
    iconColor: "#1E6848",
  },
};

export function AccessBanner({
  actionLabel,
  body,
  disabled,
  onAction,
  title,
  tone,
}: {
  actionLabel?: string;
  body: string;
  disabled?: boolean;
  onAction?: () => void;
  title: string;
  tone: AccessTone;
}) {
  const config = toneConfig[tone];
  const Icon = config.icon;

  return (
    <View style={[styles.banner, { backgroundColor: config.background, borderColor: config.border }]}>
      <View style={styles.iconWrap}>
        <Icon color={config.iconColor} size={22} strokeWidth={2.4} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {actionLabel && onAction ? (
          <Pressable
            disabled={disabled}
            onPress={onAction}
            style={({ pressed }) => [styles.action, pressed ? styles.pressed : null, disabled ? styles.disabled : null]}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#142131",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  banner: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  body: {
    color: "#3B4B5F",
    fontSize: 14,
    lineHeight: 20,
  },
  copy: {
    flex: 1,
  },
  disabled: {
    opacity: 0.56,
  },
  iconWrap: {
    paddingTop: 1,
  },
  pressed: {
    opacity: 0.82,
  },
  title: {
    color: "#142131",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3,
  },
});
