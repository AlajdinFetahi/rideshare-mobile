import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Udhetim } from "@/lib/udhetimet";

const { gjejUdhetiminMock } = vi.hoisted(() => ({
  gjejUdhetiminMock: vi.fn(),
}));

vi.mock("@/lib/udhetimet", () => ({
  gjejUdhetimin: gjejUdhetiminMock,
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import Detajet from "./page";

const udhetimi: Udhetim = {
  id: "2",
  nisja: "Fushë Kosovë",
  destinacioni: "AAB",
  ora: "08:15",
  vendtakimi: "Te stacioni kryesor",
  vende: 1,
};

describe("Detajet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("pret dhe paraqet udhëtimin e gjetur", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);

    const html = renderToStaticMarkup(
      await Detajet({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Fushë Kosovë – AAB");
    expect(html).toContain("Ora: 08:15");
  });

  test("paraqet gabim të sigurt kur databaza nuk arrihet", async () => {
    gjejUdhetiminMock.mockRejectedValue(new Error("connection failed"));

    const html = renderToStaticMarkup(
      await Detajet({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Nuk u lidhëm me databazën. Provo përsëri.");
  });

  test("përdor faqen not-found kur udhëtimi mungon", async () => {
    gjejUdhetiminMock.mockResolvedValue(undefined);

    await expect(
      Detajet({ params: Promise.resolve({ id: "99" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
