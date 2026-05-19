import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif"
  },
  colors: {
    brand: {
      25: "#F5FBFB",
      50: "#E6F6F7",
      75: "#D8F1F2",
      100: "#C7ECEE",
      150: "#B3E4E6",
      200: "#9FDBDE",
      300: "#63C4C7",
      400: "#28AAAD",
      500: "#0A9396",
      600: "#087F82",
      700: "#066A6C",
      800: "#055557",
      900: "#033E40"
    }
  },
  styles: {
    global: {
      body: {
        bg: "#F7F7F7",
        color: "#333333"
      }
    }
  },
  space: {
    18: "4.5rem",
    22: "5.5rem"
  },
  radii: {
    card: "4px"
  },
  shadows: {
    card: "0 8px 24px rgba(51, 51, 51, 0.06)"
  }
});
