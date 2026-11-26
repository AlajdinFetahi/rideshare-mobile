"use client";

import { useEffect, useRef, useState } from "react";
import type { Gjendja } from "@/lib/kerkesat";
import type { Udhetim } from "@/lib/udhetimet";
import { Hyrja } from "./Hyrja";
import { startPolling } from "@/lib/polling";

export function Sinkronizimi({ initialRide }: { initialRide: Udhetim }) {
  const [state, setState] = useState<Gjendja | null>(null);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const read = useRef<() => Promise<void>>(async () => {});
  const active = useRef<AbortController | null>(null);
  const mutating = useRef(false);
  const mounted = useRef(false);
  const url = `/api/udhetimet/${encodeURIComponent(initialRide.id)}/gjendja`;

  useEffect(() => {
    mounted.current = true;
    let reading: AbortController | null = null;
    const refresh = async () => {
      if (reading || mutating.current) return;
      const controller = new AbortController();
      reading = controller;
      active.current = controller;
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (response.status === 401 && mounted.current && active.current === controller) setLoginRequired(true);
        if (!response.ok) throw new Error();
        const next: Gjendja = await response.json();
        if (mounted.current && active.current === controller && !mutating.current) {
          setState(next);
          setConnected(true);
          setLoginRequired(false);
        }
      } catch {
        if (mounted.current && active.current === controller) setConnected(false);
      } finally {
        clearTimeout(timeout);
        if (reading === controller) reading = null;
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
      reading = null;
      void refresh();
    };
    read.current = refresh;
    const stop = startPolling(() => void refresh(), offline, online);
    return () => {
      mounted.current = false;
      stop();
      active.current?.abort();
      active.current = null;
    };
  }, [url]);

  async function mutate(requestId?: string) {
    if (mutating.current || !connected) return;
    mutating.current = true;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setMessage("");
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: requestId ? "accept" : "request", requestId }),
        cache: "no-store", signal: controller.signal,
      });
      const result = await response.json();
      if (!mounted.current) return;
      if (!response.ok) {
        setMessage(result.error);
      } else {
        setMessage(requestId ? "Pranimi u ruajt" : "Kërkesa u dërgua");
      }
    } catch {
      if (mounted.current) {
        setConnected(false);
        setMessage("Veprimi nuk u konfirmua. Kontrollo gjendjen pas rilidhjes.");
      }
    } finally {
      clearTimeout(timeout);
      mutating.current = false;
      if (active.current === controller) active.current = null;
      if (mounted.current) {
        setBusy(false);
        await read.current();
      }
    }
  }

  const ride = state?.ride ?? initialRide;
  const requests = state?.requests ?? [];
  return <section aria-label="Gjendja e udhëtimit">
    <h1>{ride.nisja} – {ride.destinacioni}</h1>
    <p>ID e udhëtimit: {ride.id}</p>
    <p>Ora: {ride.ora}</p>
    <p>Vendtakimi: {ride.vendtakimi}</p>
    <p>Vende të lira: <strong data-testid="ride-seats">{ride.vende}</strong></p>
    <p role="status">{connected ? "Gjendja u lexua nga serveri" : "Po rilidhemi · të dhënat mund të jenë të vjetra"}</p>
    <p>Përditësim automatik çdo 5 sekonda</p>
    {loginRequired && <Hyrja authenticated={false} />}
    {!state ? <p>Duke lexuar gjendjen…</p> : state.driver ? <>
      <h2>Kërkesat për shoferin</h2>
      {!requests.length && <p>Ende pa kërkesë</p>}
      {requests.map(request => <div key={request.id}>
        <p>Kërkesa {request.id}: {request.status === "accepted" ? "U pranua" : "Në pritje"}</p>
        {request.status === "pending" && <button className="action" disabled={!connected || busy || ride.vende === 0}
          onClick={() => void mutate(request.id)}>{busy ? "Duke ruajtur…" : "Prano kërkesën"}</button>}
      </div>)}
    </> : <>
      <p>{requests[0]?.status === "accepted" ? "U pranua · Vendi u konfirmua" : requests.length ? "Në pritje" : "Pa kërkesë"}</p>
      {!requests.length && <button className="action" disabled={!connected || busy || ride.vende === 0}
        onClick={() => void mutate()}>{busy ? "Duke dërguar…" : "Kërko një vend"}</button>}
    </>}
    <p role="status">{message}</p>
  </section>;
}
