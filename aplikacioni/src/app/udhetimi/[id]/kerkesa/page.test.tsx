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

import Kerkesa from "./page";

const udhetimi: Udhetim = {
  id: "2",
  nisja: "Fushë Kosovë",
  destinacioni: "AAB",
  ora: "08:15",
  vendtakimi: "Te stacioni kryesor",
  vende: 1,
};

describe("Kerkesa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("pret udhëtimin dhe paraqet simulimin kur ka vende", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);

    const html = renderToStaticMarkup(
      await Kerkesa({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Simulim: Në pritje");
    expect(html).toContain("Kërkesa për Fushë Kosovë");
  });

  test("paraqet mungesën e vendeve pa simuluar kërkesë", async () => {
    gjejUdhetiminMock.mockResolvedValue({ ...udhetimi, vende: 0 });

    const html = renderToStaticMarkup(
      await Kerkesa({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Nuk ka vende të lira.");
    expect(html).not.toContain("Simulim: Në pritje");
  });

  test("paraqet gabim të sigurt kur databaza nuk arrihet", async () => {
    gjejUdhetiminMock.mockRejectedValue(new Error("connection failed"));

    const html = renderToStaticMarkup(
      await Kerkesa({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Nuk u lidhëm me databazën. Provo përsëri.");
  });
});
