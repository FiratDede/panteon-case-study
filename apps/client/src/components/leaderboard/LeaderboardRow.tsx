import { Td, Text, Tr } from "@chakra-ui/react";
import type { LeaderboardEntry } from "../../types/leaderboard";

type Props = {
  entry: LeaderboardEntry;
  highlighted?: boolean;
};

export function LeaderboardRow({ entry, highlighted = false }: Props) {
  return (
    <Tr
      bg={highlighted ? "brand.50" : "white"}
      borderBottom="1px solid"
      borderColor="#E0E0E0"
      transition="background 120ms ease"
      _hover={{ bg: highlighted ? "brand.50" : "#F7F7F7" }}
    >
      <Td color="#333333" fontWeight="700" w={{ base: "64px", md: "80px" }}>
        #{entry.rank}
      </Td>
      <Td>
        <Text color="#333333" fontWeight="700" noOfLines={1}>
          {entry.playerName}
        </Text>
      </Td>
    </Tr>
  );
}
