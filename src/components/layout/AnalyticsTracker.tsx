'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordAnalyticsEvent } from '@/services/analyticsApi';
import { getVisitorId, getSessionId } from '@/lib/analyticsVisitor';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname) return;
    if (!mounted.current) {
      mounted.current = true;
      recordAnalyticsEvent({
        type: 'session_start',
        path: pathname,
        referrer: document.referrer || undefined,
        title: document.title,
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
      });
    }
    recordAnalyticsEvent({
      type: 'page_view',
      path: pathname,
      referrer: document.referrer || undefined,
      title: document.title,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
    });
  }, [pathname]);

  return null;
}
