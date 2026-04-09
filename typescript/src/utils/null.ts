export function getOrThrow<T>(
  value: T | null | undefined,
  message = "Unexpected null reference",
): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}
