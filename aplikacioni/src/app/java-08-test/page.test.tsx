import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import Week08Test from "./page";

test("faqja fiktive përmban kontratën unike dhe mesazhet bosh pa databazë", () => {
  const html = renderToStaticMarkup(<Week08Test />);
  for (const testId of [
    "meeting-input", "confirm-meeting", "confirmed-meeting", "meeting-error",
    "locate-me", "location-status", "location-accuracy",
  ]) {
    expect(html.split(`data-testid="${testId}"`)).toHaveLength(2);
  }
  expect(html).toContain('data-state="idle"');
  expect(html).toContain("Ende pa zgjedhje");
  expect(html).toContain('role="alert"></p>');
  expect(html).toContain('data-testid="location-accuracy" aria-live="polite"></p>');
  expect(html).toContain("Dritoni");
});
