import {
  Alert,
  AlertIcon,
  Box,
  Button,
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
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { LeaderboardRow } from "../components/leaderboard/LeaderboardRow";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { formatDuration, formatMoney } from "../lib/format";

const PAGE_SIZE = 10;

export function LeaderBoardScreen() {
  const [searchInput, setSearchInput] = useState("player-120");
  const [playerName, setPlayerName] = useState("player-120");
  const [page, setPage] = useState(1);
  const { data, loading, error } = useLeaderboard(playerName);

  const visibleEntries = data?.top100 ?? [];
  const totalPages = Math.max(1, Math.ceil(visibleEntries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedEntries = visibleEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const searchedPlayerWasNotFound = Boolean(playerName && (error === "Player not found." || (data && !data.currentPlayer)));

  function submitSearch() {
    setPlayerName(searchInput.trim());
    setPage(1);
  }

  return (
    <Box minH="100vh" bg="#F7F7F7" py={{ base: 8, md: 12 }}>
      <Container maxW="1120px" px={{ base: 4, md: 6 }}>
        <Stack spacing={{ base: 6, md: 8 }}>
          <Stack spacing={2} textAlign="center">
            <Heading as="h1" fontSize={{ base: "28px", md: "32px" }} fontWeight="semibold" letterSpacing="0">
              Leaderboard
            </Heading>
            <Text color="#666666" fontSize={{ base: "sm", md: "md" }}>
              Top Performers
            </Text>
          </Stack>

          <Box bg="white" border="1px solid #E0E0E0" borderRadius="card" boxShadow="card" p={{ base: 4, md: 5 }}>
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
                  _focusVisible={{ boxShadow: "0 0 0 2px rgba(10, 147, 150, 0.22)" }}
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

          <Box bg="white" border="1px solid #E0E0E0" borderRadius="card" boxShadow="card" overflow="hidden">
            {loading || !data ? (
              <Stack spacing={0}>
                <Skeleton height="56px" />
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} height="58px" borderTop="1px solid #E0E0E0" />
                ))}
              </Stack>
            ) : (
              <>
                <TableContainer maxH={{ base: "none", md: "640px" }} overflowY="auto">
                  <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead position="sticky" top={0} zIndex={1} bg="#F7F7F7">
                      <Tr>
                        <Th color="#333333" borderColor="#E0E0E0">
                          Rank
                        </Th>
                        <Th color="#333333" borderColor="#E0E0E0">
                          Name
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pagedEntries.map((entry) => (
                        <LeaderboardRow
                          key={entry.playerId}
                          entry={entry}
                          highlighted={entry.playerName === data.currentPlayer?.playerName}
                        />
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>

                <Flex
                  align={{ base: "stretch", sm: "center" }}
                  justify="space-between"
                  gap={3}
                  direction={{ base: "column", sm: "row" }}
                  p={4}
                  borderTop="1px solid #E0E0E0"
                >
                  <Text color="#666666" fontSize="sm" textAlign={{ base: "center", sm: "left" }}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <HStack justify={{ base: "center", sm: "flex-end" }}>
                    <Button
                      aria-label="Previous page"
                      size="sm"
                      variant="outline"
                      borderColor="#E0E0E0"
                      isDisabled={currentPage === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      _focusVisible={{ boxShadow: "0 0 0 2px rgba(10, 147, 150, 0.22)" }}
                    >
                      Previous
                    </Button>
                    <Button
                      aria-label="Next page"
                      size="sm"
                      bg="brand.500"
                      color="white"
                      isDisabled={currentPage === totalPages}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      _hover={{ bg: "brand.600" }}
                      _focusVisible={{ boxShadow: "0 0 0 3px rgba(10, 147, 150, 0.28)" }}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
