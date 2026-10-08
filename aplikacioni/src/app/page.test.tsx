import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Udhetim } from "@/lib/udhetimet";

const { lexoUdhetimetMock } = vi.hoisted(() => ({
  lexoUdhetimetMock: vi.fn(),
}));

vi.mock("@/lib/udhetimet", () => ({
  lexoUdhetimet: lexoUdhetimetMock,
}));

import Home from "./page";

const udhetimi: Udhetim = {
  id: "1",
  nisja: "Prishtinë",
  destinacioni: "AAB",
  ora: "08:00",
  vendtakimi: "Stacioni i autobusëve",
  vende: 2,
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("paraqet udhëtimet e lexuara nga databaza", async () => {
    lexoUdhetimetMock.mockResolvedValue([udhetimi]);

    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Prishtinë – AAB");
    expect(html).toContain("Burimi: Neon");
  });

  test("paraqet mesazhin e listës bosh", async () => {
    lexoUdhetimetMock.mockResolvedValue([]);

    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Nuk ka udhëtime për momentin.");
  });

  test("paraqet gabim të sigurt kur databaza nuk arrihet", async () => {
    lexoUdhetimetMock.mockRejectedValue(new Error("connection failed"));

    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Nuk u lidhëm me databazën. Provo përsëri.");
    expect(html).toContain('role="alert"');
  });
});
