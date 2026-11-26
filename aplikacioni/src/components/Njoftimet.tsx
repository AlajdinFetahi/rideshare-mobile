"use client";

import { useEffect, useRef, useState } from "react";
import type { KerkesaDetail, NjoftimetState } from "@/lib/njoftimet";
import { startPolling } from "@/lib/polling";

export function Njoftimet() {
  const [state, setState] = useState<NjoftimetState | null>(null);
  const [connected, setConnected] = useState(false);
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<KerkesaDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const active = useRef<AbortController | null>(null);
  const mutating = useRef(false);
  const mounted = useRef(false);
  const seen = useRef<Set<string> | null>(null);

  function receive(next: NjoftimetState) {
    const fresh = seen.current && next.notifications.filter(n => !seen.current!.has(n.id));
    if (fresh && fresh.length) setToast(`Shoferi e pranoi kërkesën · ${fresh.map(n => `#${n.id}`).join(", ")}`);
    if (!seen.current) seen.current = new Set();
    next.notifications.forEach(n => seen.current!.add(n.id));
    setState(next);
    setConnected(true);
  }

  useEffect(() => {
    mounted.current = true;
    const refresh = async () => {
      if (active.current || mutating.current || !navigator.onLine) return;
      const controller = new AbortController();
      active.current = controller;
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch("/api/njoftimet", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) {
          if (mounted.current && active.current === controller) {
            setState(null);
            seen.current = null;
            setDetail(null);
            setToast("");
          }
          return;
        }
        if (!response.ok) throw new Error();
        const next: NjoftimetState = await response.json();
        if (mounted.current && active.current === controller) receive(next);
      } catch {
        if (mounted.current && active.current === controller) setConnected(false);
      } finally {
        clearTimeout(timeout);
        if (active.current === controller) active.current = null;
      }
    };
    const offline = () => {
      active.current?.abort();
      setConnected(false);
    };
    const online = () => {
      active.current?.abort();
      active.current = null;
      void refresh();
    };
    const stop = startPolling(() => void refresh(), offline, online);
    return () => {
      mounted.current = false;
      stop();
      active.current?.abort();
      active.current = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timeout);
  }, [toast]);

  async function open(id: string) {
    if (!connected || mutating.current) return;
    mutating.current = true;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/njoftimet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), cache: "no-store", signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) throw new Error();
      if (mounted.current && active.current === controller) {
        receive(result);
        setDetail(result.detail);
      }
    } catch {
      if (mounted.current) setError("Leximi nuk u konfirmua. Provo përsëri me Hap kërkesën.");
    } finally {
      clearTimeout(timeout);
      if (active.current === controller) active.current = null;
      mutating.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  if (!state) return null;
  return <aside className="notifications" aria-label="Njoftimet personale">
    <button className="action" aria-expanded={visible} onClick={() => setVisible(!visible)}>
      🔔 Njoftimet ({state.unreadCount})
    </button>
    {!connected && <p role="status">Pa lidhje · pamja e fundit</p>}
    {toast && <p role="status" data-testid="notification-toast">{toast}</p>}
    {visible && <section>
      {error && <p role="alert">{error}</p>}
      {detail ? <>
        <h2>Kërkesa #{detail.request_id}</h2>
        <p>Udhëtimi: {detail.ride_id}</p>
        <p>{detail.status === "accepted" ? "Shoferi e pranoi kërkesën" : "Në pritje"}</p>
        <button className="action" onClick={() => setDetail(null)}>Kthehu te njoftimet</button>
      </> : <>
        <h2>Njoftimet personale</h2>
        {!state.notifications.length && <p>Ende pa njoftime</p>}
        {state.notifications.map(n => <article className="trip-card" key={n.id}>
          <p>Njoftimi #{n.id} · {n.read_at ? "I LEXUAR" : "I PALEXUAR"}</p>
          <p>Shoferi e pranoi kërkesën</p>
          <p>Kërkesa #{n.request_id}</p>
          <button className="action" disabled={!connected || busy} onClick={() => void open(n.id)}>Hap kërkesën</button>
        </article>)}
      </>}
    </section>}
  </aside>;
}
