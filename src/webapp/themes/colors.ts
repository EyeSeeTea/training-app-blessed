import { Dictionary } from "../../types/utils";

export type Color = "primary" | "secondary" | "default" | "inherit";
export type ColorPalette = "main" | "light" | "dark";

const defaultColor = "#43CBCB";

const theme: Dictionary<Dictionary<string>> = {
    main: {
        primary: defaultColor,
        secondary: "#ff8f02",
    },
    light: {
        primary: "#7efffe",
        secondary: "#ffc046",
    },
    dark: {
        primary: "#009a9a",
        secondary: "#c56000",
    },
};

export const getColor = (color: Color, palette: ColorPalette = "main") => {
    return theme[palette]?.[color] ?? defaultColor;
};
