import { Avatar, Badge, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import { Trophy } from "lucide-react";
import { formatMoney } from "../../../lib/format";
import type { LeaderboardEntry } from "../types";

type Props = {
  entry: LeaderboardEntry;
  highlighted?: boolean;
};

export function LeaderboardRow({ entry, highlighted = false }: Props) {
  const isPodium = entry.rank <= 3;

  return (
    <Grid
      templateColumns={{ base: "52px 1fr 86px", md: "72px 1fr 140px 120px" }}
      gap={3}
      alignItems="center"
      minH="58px"
      px={3}
      py={2}
      borderBottom="1px solid"
      borderColor="blackAlpha.100"
      bg={highlighted ? "brand.50" : "white"}
    >
      <GridItem>
        <HStack spacing={1}>
          {isPodium ? <Trophy size={17} color="#a86500" /> : null}
          <Text fontWeight="800">#{entry.rank}</Text>
        </HStack>
      </GridItem>
      <GridItem minW={0}>
        <HStack minW={0}>
          <Avatar name={entry.displayName} size="sm" />
          <Text fontWeight="700" noOfLines={1}>
            {entry.displayName}
          </Text>
          {entry.country ? <Badge variant="subtle">{entry.country}</Badge> : null}
        </HStack>
      </GridItem>
      <GridItem textAlign="right">
        <Text fontWeight="800">{formatMoney(entry.score)}</Text>
        <Text display={{ base: "block", md: "none" }} color="blackAlpha.600" fontSize="xs">
          +{formatMoney(entry.projectedReward)}
        </Text>
      </GridItem>
      <GridItem display={{ base: "none", md: "block" }} textAlign="right">
        <Text color="brand.700" fontWeight="800">
          +{formatMoney(entry.projectedReward)}
        </Text>
      </GridItem>
    </Grid>
  );
}
