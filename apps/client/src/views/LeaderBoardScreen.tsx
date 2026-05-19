import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { LeaderboardRow } from "../components/leaderboard/LeaderboardRow";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { formatDuration, formatMoney } from "../lib/format";

function formatWeekLabel(weekId?: string) {
  const match = /W(?<week>\d{2})$/.exec(weekId ?? "");
  return match?.groups ? `W${match.groups.week}` : weekId;
}

export function LeaderBoardScreen() {
  const [searchInput, setSearchInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const { data, loading, error } = useLeaderboard(playerName);

  const visibleEntries = data?.top100 ?? [];
  const visiblePlayerIds = new Set(visibleEntries.map((entry) => entry.playerId));
  const aroundPlayerEntries = (data?.aroundPlayer ?? []).filter((entry) => !visiblePlayerIds.has(entry.playerId));
  const searchedPlayerWasNotFound = Boolean(playerName && (error === "Player not found." || (data && !data.currentPlayer)));

  useEffect(() => {
    if (!playerName || loading || !data?.currentPlayer) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(`leaderboard-player-${data.currentPlayer?.playerId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  }, [data, loading, playerName]);

  function submitSearch() {
    setPlayerName(searchInput.trim());
  }

  return (
    <Box minH="100vh" bg="#F7F7F7" py={{ base: 8, md: 12 }}>
      <Container maxW="1120px" px={{ base: 4, md: 6 }}>
        <Stack spacing={{ base: 0, md: 0, }}>
          <Stack spacing={2} margin={6} textAlign="center">
            <Heading as="h1" fontSize={{ base: "28px", md: "32px" }} fontWeight="semibold" letterSpacing="0">
              Weekly Leaderboard
            </Heading>
            <Text color="#666666" fontSize={{ base: "sm", md: "md" }}>
              Top Players
            </Text>
            {data?.week.id ? (
              <Badge alignSelf="center" bg="brand.50" color="brand.700" border={"1px solid #bbb9b9"} borderRadius="card" px={3} py={1}>
                {formatWeekLabel(data.week.id)}
              </Badge>
            ) : null}
          </Stack>

          <Box bg="white" borderRadius="card" boxShadow="card" p={{ base: 4, }}>
            <Stack spacing={4}>
              <Flex gap={3} direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }}>
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitSearch();
                  }}
                  placeholder="Search by name"
                  bg="white"
                  borderColor="#E0E0E0"
                  color="#333333"
                  fontSize="16px"
                  focusBorderColor="brand.500"
                />
                <IconButton
                  aria-label="Search leaderboard"
                  icon={<FaSearch />}
                  onClick={submitSearch}
                  bg="brand.500"
                  color="white"
                  minW={{ base: "100%", md: "44px" }}
                  _hover={{ bg: "brand.600" }}
                  _focusVisible={{ boxShadow: "0 0 0 3px rgba(10, 147, 150, 0.28)" }}
                />
              </Flex>

              {data ? (
                <HStack spacing={6} color="#666666" fontSize="sm" flexWrap="wrap">
                  <Text>
                    Prize Pool:{" "}
                    <Box as="span" color="#333333" fontWeight="700">
                      {formatMoney(data.prizePool)}
                    </Box>
                  </Text>
                  <Text>
                    Week Ends:{" "}
                    <Box as="span" color="#333333" fontWeight="700">
                      {formatDuration(data.timeRemainingSeconds)}
                    </Box>
                  </Text>
                </HStack>
              ) : null}
            </Stack>
          </Box>

          {error && error !== "Player not found." ? (
            <Alert status="error" borderRadius="card">
              <AlertIcon />
              {error}
            </Alert>
          ) : null}

          {searchedPlayerWasNotFound ? (
            <Alert status="warning" borderRadius="card" bg="white" border="1px solid #E0E0E0">
              <AlertIcon />
              Player not found.
            </Alert>
          ) : null}

          <Box bg="white" borderRadius="card" boxShadow="card" overflow="hidden">
            {loading || !data ? (
              <Stack spacing={0}>
                <Skeleton height="56px" />
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} height="58px" borderTop="1px solid #E0E0E0" />
                ))}
              </Stack>
            ) : (
              <TableContainer overflowX="auto">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead position="sticky" margin={6} borderBottom={"1px solid #c1bfbf"} top={0} zIndex={1} bg="#e9e9e9">
                    <Tr>
                      <Th color="#333333" >
                        Rank
                      </Th>
                      <Th color="#333333" >
                        Name
                      </Th>
                      <Th color="#333333" >
                        Score
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {visibleEntries.map((entry) => (
                      <LeaderboardRow
                        key={entry.playerId}
                        entry={entry}
                        rowId={`leaderboard-player-${entry.playerId}`}
                        highlighted={entry.playerName === data.currentPlayer?.playerName}
                      />
                    ))}

                    {aroundPlayerEntries.length > 0 ? (
                      <>
                        <Tr>
                          <Td colSpan={3} bg="#F7F7F7" py={3} textAlign="center">
                            <Text color="#666666" fontSize="lg" fontWeight="700" letterSpacing="2px">
                              ...
                            </Text>
                          </Td>
                        </Tr>
                        {aroundPlayerEntries.map((entry) => (
                          <LeaderboardRow
                            key={entry.playerId}
                            entry={entry}
                            rowId={`leaderboard-player-${entry.playerId}`}
                            highlighted={entry.playerName === data.currentPlayer?.playerName}
                          />
                        ))}
                      </>
                    ) : null}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
