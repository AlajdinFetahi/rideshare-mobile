import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Udhetim } from "./udhetimet";

const { getSqlMock } = vi.hoisted(() => ({ getSqlMock: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("./db", () => ({ getSql: getSqlMock }));

import { gjejUdhetimin, lexoUdhetimet } from "./udhetimet";

const udhetimi: Udhetim = {
  id: "2",
  nisja: "Fushë Kosovë",
  destinacioni: "AAB",
  ora: "08:15",
  vendtakimi: "Te stacioni kryesor",
  vende: 1,
};

describe("udhetimet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("lexon listën e udhëtimeve nga rezultati SQL", async () => {
    const rows = [udhetimi];
    getSqlMock.mockReturnValue(vi.fn().mockResolvedValue(rows));

    await expect(lexoUdhetimet()).resolves.toEqual(rows);
  });

  test("gjen udhëtimin sipas id-së së parametrizuar", async () => {
    const sql = vi.fn(
      async (_strings: TemplateStringsArray, ...values: unknown[]) =>
        values[0] === udhetimi.id ? [udhetimi] : [],
    );
    getSqlMock.mockReturnValue(sql);

    await expect(gjejUdhetimin("2")).resolves.toEqual(udhetimi);
    await expect(gjejUdhetimin("99")).resolves.toBeUndefined();
  });
});
