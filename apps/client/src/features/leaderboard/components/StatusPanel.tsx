import { SimpleGrid, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { formatDuration, formatMoney } from "../../../lib/format";
import type { LeaderboardResponse } from "../types";

type Props = {
  data: LeaderboardResponse;
};

export function StatusPanel({ data }: Props) {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
      <Stat bg="white" borderRadius="card" border="1px solid" borderColor="blackAlpha.100" p={4}>
        <StatLabel>Prize Pool</StatLabel>
        <StatNumber>{formatMoney(data.prizePool)}</StatNumber>
      </Stat>
      <Stat bg="white" borderRadius="card" border="1px solid" borderColor="blackAlpha.100" p={4}>
        <StatLabel>Week Ends In</StatLabel>
        <StatNumber>{formatDuration(data.timeRemainingSeconds)}</StatNumber>
      </Stat>
      <Stat bg="white" borderRadius="card" border="1px solid" borderColor="blackAlpha.100" p={4}>
        <StatLabel>Reward Rules</StatLabel>
        <StatNumber fontSize="lg">20% / 15% / 10%</StatNumber>
      </Stat>
    </SimpleGrid>
  );
}
