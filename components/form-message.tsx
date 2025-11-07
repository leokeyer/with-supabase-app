export type Message =
  | { success: string }
  | { error: string }
  | { message: string }
  | Record<string, never>;

export function FormMessage({ message }: { message: Message | Record<string, unknown> }) {
  if (!message || Object.keys(message).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && typeof message.success === "string" && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {message.success}
        </div>
      )}
      {"error" in message && typeof message.error === "string" && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {message.error}
        </div>
      )}
      {"message" in message && typeof message.message === "string" && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}
