# API

## Leaderboard

```text
GET /api/v1/leaderboards/current?playerName={name}
GET /api/v1/leaderboards/weeks/{weekId}?playerName={name}
```

Public leaderboard GET routes accept `playerName`. The server resolves the name to the stable internal `playerId`.

## Earning Event

```text
POST /api/v1/events/earn
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
POST /api/v1/admin/weeks/{weekId}/finalize
```
