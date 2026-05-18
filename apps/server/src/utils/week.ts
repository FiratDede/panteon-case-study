export function getDefaultWeekWindow(weekId: string) {
  const match = /^(?<year>\d{4})-W(?<week>\d{2})$/.exec(weekId);

  if (!match?.groups) {
    const now = new Date();
    return {
      startsAt: now,
      endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  const year = Number(match.groups.year);
  const week = Number(match.groups.week);
  const janFourth = new Date(Date.UTC(year, 0, 4));
  const day = janFourth.getUTCDay() || 7;
  const weekOneMonday = new Date(janFourth);
  weekOneMonday.setUTCDate(janFourth.getUTCDate() - day + 1);

  const startsAt = new Date(weekOneMonday);
  startsAt.setUTCDate(weekOneMonday.getUTCDate() + (week - 1) * 7);

  const endsAt = new Date(startsAt);
  endsAt.setUTCDate(startsAt.getUTCDate() + 7);

  return { startsAt, endsAt };
}

export function getTimeRemainingSeconds(endsAt: Date) {
  return Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
}
