export function startPolling(refresh: () => void, offline: () => void, online = refresh) {
  refresh();
  const timer = setInterval(refresh, 5000);
  window.addEventListener("offline", offline);
  window.addEventListener("online", online);
  return () => {
    clearInterval(timer);
    window.removeEventListener("offline", offline);
    window.removeEventListener("online", online);
  };
}
