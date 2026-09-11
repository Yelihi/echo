import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Echo · Silver & Ink",
    colorPrimary: "#1e1d1d",
    colorSecondary: "#454d54",
    appBg: "#f9f9f9",
    appContentBg: "#ffffff",
    appBorderColor: "#d9dee2",
    appBorderRadius: 12,
    textColor: "#1e1d1d",
    barBg: "#ffffff",
    barTextColor: "#595959",
    barSelectedColor: "#1e1d1d",
    inputBg: "#ffffff",
    inputBorder: "#89949e",
    inputTextColor: "#1e1d1d",
    inputBorderRadius: 12,
    fontBase: '"Noto Sans KR", system-ui, sans-serif',
  }),
});
