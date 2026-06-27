'use client';

import { captureError } from './monitoring';

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(event: string, props: AnalyticsProps = {}) {
  try {
    if (typeof window === 'undefined') return;
    const maybeMixpanel = (window as typeof window & {
      mixpanel?: { track?: (event: string, props?: AnalyticsProps) => void };
    }).mixpanel;

    maybeMixpanel?.track?.(event, props);
  } catch (error) {
    captureError(error, { area: 'mixpanel', event });
  }
}
