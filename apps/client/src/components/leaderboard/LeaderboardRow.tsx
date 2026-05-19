import { Td, Text, Tr } from "@chakra-ui/react";
import type { LeaderboardEntry } from "../../types/leaderboard";

type Props = {
  entry: LeaderboardEntry;
  highlighted?: boolean;
  rowId?: string;
};

export function LeaderboardRow({ entry, highlighted = false, rowId }: Props) {
  return (
    <Tr
      id={rowId}
      bg={highlighted ? "brand.400" : "white"}
      color={highlighted ? "white" : "#333333"}
      borderBottom="1px solid"
      borderColor="#E0E0E0"
      transition="background 120ms ease, color 120ms ease"
      _hover={{ bg: "brand.400", color: "white" }}
    >
      <Td color="inherit" fontWeight="700" w={{ base: "64px", md: "80px" }}>
        #{entry.rank}
      </Td>
      <Td>
        <Text color="inherit" fontWeight="700" noOfLines={1}>
          {entry.playerName}
        </Text>
      </Td>
      <Td>
        <Text color="inherit" fontWeight="700" noOfLines={1}>
          {entry.score}
        </Text>
      </Td>
    </Tr>
  );
}
