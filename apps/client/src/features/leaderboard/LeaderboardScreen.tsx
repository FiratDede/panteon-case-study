import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Input,
  Skeleton,
  Stack,
  Text
} from "@chakra-ui/react";
import { RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { LeaderboardRow } from "./components/LeaderboardRow";
import { StatusPanel } from "./components/StatusPanel";
import { useLeaderboard } from "./hooks/useLeaderboard";

export function LeaderboardScreen() {
  const [playerNameInput, setPlayerNameInput] = useState("player-120");
  const [playerName, setPlayerName] = useState("player-120");
  const { data, loading, error, reload } = useLeaderboard(playerName);

  return (
    <Box minH="100vh" py={{ base: 4, md: 8 }}>
      <Container maxW="1120px">
        <Stack spacing={5}>
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap={4}>
            <Box>
              <Heading size={{ base: "lg", md: "xl" }}>Weekly Leaderboard</Heading>
              <Text color="blackAlpha.700" mt={1}>
                Week {data?.week.id ?? "loading"}
              </Text>
            </Box>
            <HStack as="form" onSubmit={(event) => { event.preventDefault(); setPlayerName(playerNameInput); }}>
              <Input
                bg="white"
                value={playerNameInput}
                onChange={(event) => setPlayerNameInput(event.target.value)}
                width={{ base: "100%", md: "220px" }}
              />
              <Button leftIcon={<Search size={16} />} colorScheme="teal" type="submit">
                Find
              </Button>
              <Button aria-label="Refresh" onClick={() => void reload()} leftIcon={<RefreshCw size={16} />}>
                Refresh
              </Button>
            </HStack>
          </Flex>

          {error ? (
            <Alert status="error" borderRadius="card">
              <AlertIcon />
              {error}
            </Alert>
          ) : null}

          {loading || !data ? (
            <Stack>
              <Skeleton height="88px" />
              <Skeleton height="420px" />
            </Stack>
          ) : (
            <>
              <StatusPanel data={data} />

              {data.currentPlayer ? (
                <Box bg="white" borderRadius="card" border="1px solid" borderColor="brand.100" overflow="hidden">
                  <Box px={4} py={3} bg="brand.50">
                    <Text fontWeight="800">Your Rank</Text>
                  </Box>
                  <LeaderboardRow entry={data.currentPlayer} highlighted />
                </Box>
              ) : null}

              {data.aroundPlayer.length > 0 ? (
                <Box bg="white" borderRadius="card" border="1px solid" borderColor="blackAlpha.100" overflow="hidden">
                  <Box px={4} py={3}>
                    <Text fontWeight="800">Around You</Text>
                  </Box>
                  {data.aroundPlayer.map((entry) => (
                    <LeaderboardRow
                      key={entry.playerId}
                      entry={entry}
                      highlighted={entry.playerName === data.currentPlayer?.playerName}
                    />
                  ))}
                </Box>
              ) : null}

              <Box bg="white" borderRadius="card" border="1px solid" borderColor="blackAlpha.100" overflow="hidden">
                <Box px={4} py={3}>
                  <Text fontWeight="800">Top 100</Text>
                </Box>
                {data.top100.map((entry) => (
                  <LeaderboardRow
                    key={entry.playerId}
                    entry={entry}
                    highlighted={entry.playerName === data.currentPlayer?.playerName}
                  />
                ))}
              </Box>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
