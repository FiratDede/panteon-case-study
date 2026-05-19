import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Container,
  Heading,
  Select,
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
import { useRewardHistory } from "../hooks/useRewardHistory";
import { formatMoney } from "../lib/format";

function formatWeekLabel(weekId: string) {
  const match = /W(?<week>\d{2})$/.exec(weekId);
  return match?.groups ? `W${match.groups.week}` : weekId;
}

export function PreviousWinnersScreen() {
  const [selectedWeekId, setSelectedWeekId] = useState<string>();
  const { data, loading, error } = useRewardHistory(selectedWeekId);

  useEffect(() => {
    if (!selectedWeekId && data?.selectedWeekId) {
      setSelectedWeekId(data.selectedWeekId);
    }
  }, [data?.selectedWeekId, selectedWeekId]);

  return (
    <Box minH="100vh" bg="#F7F7F7" py={{ base: 8, md: 12 }}>
      <Container maxW="1120px" px={{ base: 4, md: 6 }}>
        <Stack spacing={{ base: 0, md: 0 }}>
          <Stack spacing={2} margin={6} textAlign="center">
            <Heading as="h1" fontSize={{ base: "28px", md: "32px" }} fontWeight="semibold" letterSpacing="0">
              Previous Winners
            </Heading>
            <Text color="#666666" fontSize={{ base: "sm", md: "md" }}>
              Prize Winners
            </Text>
            {data?.selectedWeek ? (
              <Badge alignSelf="center" bg="brand.50" color="brand.700" border="1px solid #bbb9b9" borderRadius="card" px={3} py={1}>
                {formatWeekLabel(data.selectedWeek.weekId)}
              </Badge>
            ) : null}
          </Stack>

          <Box bg="white" borderRadius="card" boxShadow="card" p={{ base: 4 }}>
            <Stack spacing={4}>
              <Select
                aria-label="Select week"
                value={selectedWeekId ?? data?.selectedWeekId ?? ""}
                onChange={(event) => setSelectedWeekId(event.target.value || undefined)}
                borderColor="#AFAFAF"
                focusBorderColor="brand.500"
                _hover={{ borderColor: "#8F8F8F" }}
                isDisabled={loading || !data || data.weeks.length === 0}
              >
                {data?.weeks.map((week) => (
                  <option key={week.weekId} value={week.weekId}>
                    {formatWeekLabel(week.weekId)} - {week.weekId}
                  </option>
                ))}
              </Select>
            </Stack>
          </Box>

          {error ? (
            <Alert status="error" borderRadius="card">
              <AlertIcon />
              {error}
            </Alert>
          ) : null}

          <Box bg="white" borderRadius="card" boxShadow="card" overflow="hidden">
            {loading ? (
              <Stack spacing={0}>
                <Skeleton height="56px" />
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} height="58px" borderTop="1px solid #E0E0E0" />
                ))}
              </Stack>
            ) : data && data.winners.length > 0 ? (
              <TableContainer overflowX="auto">
                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                  <Thead position="sticky" margin={6} borderBottom="1px solid #c1bfbf" top={0} zIndex={1} bg="#e9e9e9">
                    <Tr>
                      <Th color="#333333">Rank</Th>
                      <Th color="#333333">Name</Th>
                      <Th color="#333333">Reward</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.winners.map((winner) => (
                      <Tr
                        key={`${data.selectedWeekId}-${winner.playerId}`}
                        color="#333333"
                        borderBottom="1px solid #E0E0E0"
                        transition="background 0.15s ease, color 0.15s ease"
                        _hover={{ bg: "brand.400", color: "white" }}
                      >
                        <Td fontWeight="700" color="inherit">
                          #{winner.rank}
                        </Td>
                        <Td fontWeight="700" color="inherit">
                          {winner.playerName}
                        </Td>
                        <Td fontWeight="700" color="inherit">
                          {formatMoney(winner.amount)}
                        </Td>
                       
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Box p={6}>
                <Text color="#666666" textAlign="center">
                  No previous winners found.
                </Text>
              </Box>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
