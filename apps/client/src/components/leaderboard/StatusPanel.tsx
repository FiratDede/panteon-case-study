import { Box, HStack, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { Clock3, Coins } from "lucide-react";
import { formatDuration, formatMoney } from "../../lib/format";
import type { LeaderboardResponse } from "../../types/leaderboard";

type Props = {
  data: LeaderboardResponse;
};

export function StatusPanel({ data }: Props) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
      <Box bg="white" borderRadius="card" border="1px solid" borderColor="#E0E0E0" p={4} boxShadow="card">
        <HStack spacing={3}>
          <Icon as={Coins} boxSize={5} color="brand.500" />
          <Box>
            <Text color="#666666" fontSize="sm" fontWeight="700">
              Prize Pool
            </Text>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900">
              {formatMoney(data.prizePool)}
            </Text>
          </Box>
        </HStack>
      </Box>
      <Box bg="white" borderRadius="card" border="1px solid" borderColor="#E0E0E0" p={4} boxShadow="card">
        <HStack spacing={3}>
          <Icon as={Clock3} boxSize={5} color="brand.500" />
          <Box>
            <Text color="#666666" fontSize="sm" fontWeight="700">
              Week Ends In
            </Text>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900">
              {formatDuration(data.timeRemainingSeconds)}
            </Text>
          </Box>
        </HStack>
      </Box>
    </SimpleGrid>
  );
}
