import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Udhetim } from "@/lib/udhetimet";

const { gjejUdhetiminMock, sessionMock, favoritesMock } = vi.hoisted(() => ({
  gjejUdhetiminMock: vi.fn(),
  sessionMock: vi.fn(),
  favoritesMock: vi.fn(),
}));

vi.mock("@/lib/udhetimet", () => ({
  gjejUdhetimin: gjejUdhetiminMock,
}));
vi.mock("next-auth", () => ({ getServerSession: sessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/preferimet", () => ({ lexoPreferimet: favoritesMock }));
vi.mock("./actions", () => ({ ruajPreferimin: vi.fn() }));
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
    sessionMock.mockResolvedValue(null);
  });

  test("pret dhe paraqet udhëtimin e gjetur", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);

    const html = renderToStaticMarkup(
      await Detajet({ params: Promise.resolve({ id: "2" }) }),
    );

    expect(html).toContain("Fushë Kosovë – AAB");
    expect(html).toContain("Ora: 08:15");
    expect(html).toContain('data-testid="meeting-input"');
    expect(html).toContain('data-testid="location-status" data-state="idle"');
    expect(html).toContain("Ende pa zgjedhje");
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

  test("paraqet preferimin dhe numrin e lexuar nga serveri pas rifreskimit", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);
    sessionMock.mockResolvedValue({ user: { githubId: "test-user" } });
    favoritesMock.mockResolvedValue({ saved: true, count: 3 });
    const html = renderToStaticMarkup(await Detajet({ params: Promise.resolve({ id: "2" }) }));
    expect(favoritesMock).toHaveBeenCalledWith("test-user", "2");
    expect(html).toContain("★ I ruajtur");
    expect(html).toContain('data-testid="favorite-count">3');
  });

  test("gabimi i leximit nuk paraqitet si preferim i paruajtur", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);
    sessionMock.mockResolvedValue({ user: { githubId: "test-user" } });
    favoritesMock.mockRejectedValue(new Error("secret connection string"));
    const html = renderToStaticMarkup(await Detajet({ params: Promise.resolve({ id: "2" }) }));
    expect(html).toContain("Nuk u lexuan të preferuarat. Rifresko faqen.");
    expect(html).not.toContain("☆ Ruaj udhëtimin");
    expect(html).not.toContain("secret connection string");
  });

  test("nuk lexon preferime personale për vizitorin pa sesion", async () => {
    gjejUdhetiminMock.mockResolvedValue(udhetimi);
    const html = renderToStaticMarkup(await Detajet({ params: Promise.resolve({ id: "2" }) }));
    expect(favoritesMock).not.toHaveBeenCalled();
    expect(html).toContain("Hyr me GitHub për të ruajtur udhëtimin.");
  });
});
