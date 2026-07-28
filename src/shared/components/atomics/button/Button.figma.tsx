import figma from "@figma/code-connect";

import { Button } from "@/shared/components/atomics/button/Button";

/**
 * Figma: Echo Design System › Button
 * 텍스트 라벨을 가진 버튼. variant × size.
 */
figma.connect(Button, "<ECHO_DS>?node-id=25-2", {
  props: {
    label: figma.string("Label"),
    variant: figma.enum("Style", {
      default: "default",
      outline: "outline",
      secondary: "secondary",
      ghost: "ghost",
      destructive: "destructive",
      link: "link",
    }),
    size: figma.enum("Size", {
      xs: "xs",
      sm: "sm",
      default: "default",
      lg: "lg",
    }),
    leadingIcon: figma.boolean("Show Leading Icon", {
      true: figma.instance("Leading Icon"),
      false: undefined,
    }),
    trailingIcon: figma.boolean("Show Trailing Icon", {
      true: figma.instance("Trailing Icon"),
      false: undefined,
    }),
  },
  example: ({ label, variant, size, leadingIcon, trailingIcon }) => (
    <Button variant={variant} size={size}>
      {leadingIcon}
      {label}
      {trailingIcon}
    </Button>
  ),
});

/**
 * Figma: Echo Design System › IconButton
 * 같은 Button 컴포넌트의 정사각형 아이콘 사이즈 계열입니다.
 */
figma.connect(Button, "<ECHO_DS>?node-id=26-82", {
  props: {
    variant: figma.enum("Style", {
      default: "default",
      outline: "outline",
      secondary: "secondary",
      ghost: "ghost",
      destructive: "destructive",
    }),
    size: figma.enum("Size", {
      "icon-xs": "icon-xs",
      "icon-sm": "icon-sm",
      icon: "icon",
      "icon-lg": "icon-lg",
    }),
    icon: figma.instance("Icon"),
  },
  example: ({ variant, size, icon }) => (
    <Button variant={variant} size={size} aria-label="">
      {icon}
    </Button>
  ),
});
