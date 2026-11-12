"use client";

import { useRef, useState } from "react";
import { ruajPreferimin } from "@/app/udhetimi/[id]/actions";

export function Preferimi({ rideId, initialSaved, initialCount }: {
  rideId: string;
  initialSaved: boolean;
  initialCount: number;
}) {
  const [state, setState] = useState({
    saved: initialSaved,
    count: initialCount,
    status: initialSaved ? "saved" : "unsaved",
  });
  const pending = useRef(false);

  async function save() {
    if (pending.current || state.saved) return;
    const previous = state;
    pending.current = true;
    setState({ saved: true, count: previous.count + 1, status: "pending" });
    try {
      const result = await ruajPreferimin(rideId);
      if (!result.ok) throw new Error("Ruajtja u refuzua.");
      setState({ saved: result.saved, count: result.count, status: "saved" });
    } catch {
      setState({ ...previous, status: "error" });
    } finally {
      pending.current = false;
    }
  }

  const labels: Record<string, string> = {
    unsaved: "☆ Ruaj udhëtimin",
    pending: "★ Po ruhet...",
    saved: "★ I ruajtur",
    error: "☆ Provo përsëri",
  };
  const messages: Record<string, string> = {
    unsaved: "Nuk është te të preferuarat.",
    pending: "Po presim konfirmimin e serverit.",
    saved: "U ruajt te të preferuarat.",
    error: "Nuk u ruajt. Provo përsëri.",
  };

  return (
    <section aria-label="Preferimi personal" data-state={state.status}>
      <button className="action" type="button" onClick={save}
        disabled={state.status === "pending" || state.saved}
        aria-busy={state.status === "pending"}>
        {labels[state.status]}
      </button>
      <p role="status" aria-live="polite">{messages[state.status]}</p>
      <p>Të preferuarat: <span data-testid="favorite-count">{state.count}</span></p>
      <p>Preferim personal · jo rezervim</p>
    </section>
  );
}
