import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif"
  },
  colors: {
    brand: {
      50: "#edf7f6",
      100: "#d2ebe8",
      500: "#248a84",
      700: "#16635f",
      900: "#0d3434"
    },
    coin: {
      100: "#fff2bf",
      500: "#f2b705",
      700: "#a86500"
    }
  },
  styles: {
    global: {
      body: {
        bg: "#f5f7fa",
        color: "#14213d"
      }
    }
  },
  radii: {
    card: "8px"
  }
});
