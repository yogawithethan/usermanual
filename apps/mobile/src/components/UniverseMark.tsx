import { Atom, Moon, Mountain, Sun, Zap } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

type Mark = "atom" | "bolt" | "moon" | "mountain" | "sun";

const icons = {
  atom: Atom,
  bolt: Zap,
  moon: Moon,
  mountain: Mountain,
  sun: Sun,
};

export function UniverseMark({
  backgroundColor,
  color,
  mark,
  size = 46,
}: {
  backgroundColor: string;
  color: string;
  mark: Mark;
  size?: number;
}) {
  const Icon = icons[mark];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}
    >
      <Icon color={color} size={Math.round(size * 0.52)} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
});
