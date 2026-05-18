import { ChakraProvider } from "@chakra-ui/react";
import { LeaderboardScreen } from "../features/leaderboard/LeaderboardScreen";
import { theme } from "../theme/theme";

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <LeaderboardScreen />
    </ChakraProvider>
  );
}
