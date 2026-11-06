"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Reporta las métricas Web Vitals (LCP, CLS, INP, FCP, TTFB) en la consola del
 * navegador. En producción se podrían enviar a un servicio de analítica.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    console.info(`[web-vitals] ${metric.name}: ${Math.round(metric.value * 100) / 100} (${metric.rating})`);
  });

  return null;
}
