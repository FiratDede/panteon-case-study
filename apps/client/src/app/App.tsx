import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { theme } from "../theme/theme";
import { LeaderBoardScreen } from "../views/LeaderBoardScreen";

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/leaderboard" replace />} />
          <Route path="/leaderboard" element={<LeaderBoardScreen />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}
