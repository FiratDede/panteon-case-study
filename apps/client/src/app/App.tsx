import { Box, Button, ChakraProvider, Container, HStack, Text } from "@chakra-ui/react";
import { BrowserRouter, Link as RouterLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { theme } from "../theme/theme";
import { LeaderBoardScreen } from "../views/LeaderBoardScreen";
import { PreviousWinnersScreen } from "../views/PreviousWinnersScreen";

function Navbar() {
  const location = useLocation();

  return (
    <Box bg="white" borderBottom="1px solid #E0E0E0" position="sticky" top={0} zIndex={10}>
      <Container maxW="1120px" px={{ base: 4, md: 6 }} py={3}>
        <HStack justify="space-between" spacing={4}>
          <Text color="#333333" fontWeight="800">
            Panteon Case Study
          </Text>
          <HStack spacing={2}>
            <Button
              as={RouterLink}
              to="/leaderboard"
              size="sm"
              variant={location.pathname === "/leaderboard" ? "solid" : "ghost"}
              bg={location.pathname === "/leaderboard" ? "brand.500" : undefined}
              color={location.pathname === "/leaderboard" ? "white" : "#333333"}
              _hover={{ bg: location.pathname === "/leaderboard" ? "brand.600" : "brand.50" }}
            >
              Leaderboard
            </Button>
            <Button
              as={RouterLink}
              to="/previous-winners"
              size="sm"
              variant={location.pathname === "/previous-winners" ? "solid" : "ghost"}
              bg={location.pathname === "/previous-winners" ? "brand.500" : undefined}
              color={location.pathname === "/previous-winners" ? "white" : "#333333"}
              _hover={{ bg: location.pathname === "/previous-winners" ? "brand.600" : "brand.50" }}
            >
              Winners
            </Button>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/leaderboard" replace />} />
          <Route path="/leaderboard" element={<LeaderBoardScreen />} />
          <Route path="/previous-winners" element={<PreviousWinnersScreen />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}
