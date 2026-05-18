# API

## Leaderboard

```text
GET /api/leaderboard/weeks/current?playerName={name}
GET /api/leaderboard/weeks/{weekId}?playerName={name}
```

Public leaderboard GET routes accept `playerName`. The server resolves the name to the stable internal `playerId`.

## Earning Event

```text
POST /api/events/earn
```

Body:

```json
{
  "playerName": "player-001",
  "amount": 1000,
  "idempotencyKey": "event-unique-key"
}
```

## Finalization

```text
POST /api/admin/weeks/{weekId}/finalize
```
