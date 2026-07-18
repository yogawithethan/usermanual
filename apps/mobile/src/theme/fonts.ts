import { useFonts } from "expo-font";
import { AlegreyaSans_400Regular } from "@expo-google-fonts/alegreya-sans/400Regular";
import { AlegreyaSans_700Bold } from "@expo-google-fonts/alegreya-sans/700Bold";
import { Amaranth_400Regular } from "@expo-google-fonts/amaranth/400Regular";
import { Amaranth_700Bold } from "@expo-google-fonts/amaranth/700Bold";
import { LexendDeca_400Regular } from "@expo-google-fonts/lexend-deca/400Regular";
import { LexendDeca_700Bold } from "@expo-google-fonts/lexend-deca/700Bold";
import { LexendExa_400Regular } from "@expo-google-fonts/lexend-exa/400Regular";
import { LexendExa_700Bold } from "@expo-google-fonts/lexend-exa/700Bold";
import { Lobster_400Regular } from "@expo-google-fonts/lobster/400Regular";
import { Quicksand_400Regular } from "@expo-google-fonts/quicksand/400Regular";
import { Quicksand_700Bold } from "@expo-google-fonts/quicksand/700Bold";

export const fontFamilies = {
  alegreyaSans: "AlegreyaSans_400Regular",
  alegreyaSansBold: "AlegreyaSans_700Bold",
  amaranth: "Amaranth_400Regular",
  amaranthBold: "Amaranth_700Bold",
  lexendDeca: "LexendDeca_400Regular",
  lexendDecaBold: "LexendDeca_700Bold",
  lexendExa: "LexendExa_400Regular",
  lexendExaBold: "LexendExa_700Bold",
  lobster: "Lobster_400Regular",
  quicksand: "Quicksand_400Regular",
  quicksandBold: "Quicksand_700Bold",
  system: undefined,
} as const;

export function useMobileFonts() {
  return useFonts({
    [fontFamilies.alegreyaSans]: AlegreyaSans_400Regular,
    [fontFamilies.alegreyaSansBold]: AlegreyaSans_700Bold,
    [fontFamilies.amaranth]: Amaranth_400Regular,
    [fontFamilies.amaranthBold]: Amaranth_700Bold,
    [fontFamilies.lexendDeca]: LexendDeca_400Regular,
    [fontFamilies.lexendDecaBold]: LexendDeca_700Bold,
    [fontFamilies.lexendExa]: LexendExa_400Regular,
    [fontFamilies.lexendExaBold]: LexendExa_700Bold,
    [fontFamilies.lobster]: Lobster_400Regular,
    [fontFamilies.quicksand]: Quicksand_400Regular,
    [fontFamilies.quicksandBold]: Quicksand_700Bold,
  });
}
