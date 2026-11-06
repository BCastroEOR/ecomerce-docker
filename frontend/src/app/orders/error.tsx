"use client";

import { SegmentError } from "@/components/segment-error";

export default function OrdersError({ error, retry }: { error: unknown; retry: () => void }) {
  return <SegmentError error={error} retry={retry} title="No se pudo cargar tu historial" />;
}
