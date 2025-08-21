export function generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, 2 + length);
}
export function parseDurationToSeconds(duration: string): number {
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
}
  