"use client";

import { useId, useState, type FormEvent } from "react";

type LocationState = "idle" | "loading" | "success" | "denied" | "timeout" | "unavailable";

const locationMessages: Record<LocationState, string> = {
  idle: "",
  loading: "Po kërkojmë vendndodhjen...",
  success: "Pozicioni u mor",
  denied: "Leja u refuzua. Shkruaj vendtakimin vetë.",
  timeout: "Koha mbaroi. Provo sërish ose shkruaj vendtakimin.",
  unavailable: "Vendndodhja nuk është e disponueshme. Shkruaj vendtakimin vetë.",
};

export function MeetingPoint() {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [error, setError] = useState("");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  function confirmMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const meeting = draft.trim();
    if (!meeting) {
      setError("Shkruaj një vendtakim para konfirmimit.");
      return;
    }
    setConfirmed(meeting);
    setError("");
  }

  function locateMe() {
    setAccuracy(null);
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      return;
    }
    setLocationState("loading");
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAccuracy(position.coords.accuracy);
          setLocationState("success");
        },
        (failure) => {
          setLocationState(failure.code === 1 ? "denied" : failure.code === 3 ? "timeout" : "unavailable");
        },
        { timeout: 10000 },
      );
    } catch {
      setLocationState("unavailable");
    }
  }

  return (
    <section className="trip-card meeting-point" aria-label="Zgjedh vendtakimin">
      <button type="button" className="action" data-testid="locate-me"
        disabled={locationState === "loading"} onClick={locateMe}>
        Përdor vendndodhjen time
      </button>
      <p>Vendndodhja kërkohet vetëm kur klikon.</p>
      <p data-testid="location-status" data-state={locationState} role="status">
        {locationMessages[locationState]}
      </p>
      <p data-testid="location-accuracy" aria-live="polite">
        {accuracy !== null ? `Saktësia: ${accuracy} m` : ""}
      </p>
      <form onSubmit={confirmMeeting}>
        <label htmlFor={inputId}>Shkruaj vendtakimin</label>
        <input id={inputId} data-testid="meeting-input" placeholder="p.sh. Biblioteka"
          value={draft} onChange={(event) => setDraft(event.target.value)}
          aria-invalid={Boolean(error)} aria-describedby={`${inputId}-error`} />
        <p id={`${inputId}-error`} data-testid="meeting-error" role="alert">{error}</p>
        <button type="submit" className="action" data-testid="confirm-meeting">Konfirmo në telefon</button>
      </form>
      <div className="meeting-result" aria-live="polite">
        <p>Vendtakimi i konfirmuar</p>
        <strong data-testid="confirmed-meeting">{confirmed || "Ende pa zgjedhje"}</strong>
      </div>
      <p>Zgjedhje lokale · nuk është dërguar te shoferi.</p>
    </section>
  );
}
