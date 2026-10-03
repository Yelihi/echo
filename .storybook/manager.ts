import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Echo · Editorial",
    colorPrimary: "#e51e2a",
    colorSecondary: "#454d54",
    appBg: "#fafaf9",
    appContentBg: "#ffffff",
    appBorderColor: "#d9dee2",
    appBorderRadius: 12,
    textColor: "#202020",
    barBg: "#ffffff",
    barTextColor: "#595959",
    barSelectedColor: "#e51e2a",
    inputBg: "#ffffff",
    inputBorder: "#89949e",
    inputTextColor: "#202020",
    inputBorderRadius: 12,
    fontBase: '"Noto Sans KR", system-ui, sans-serif',
  }),
});
