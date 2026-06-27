export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    const maybeSentry = (window as typeof window & {
      Sentry?: { captureException?: (error: unknown, options?: unknown) => void };
    }).Sentry;

    maybeSentry?.captureException?.(error, {
      extra: context,
    });
  }

  console.error('[ProKicks]', context || {}, error);
}
