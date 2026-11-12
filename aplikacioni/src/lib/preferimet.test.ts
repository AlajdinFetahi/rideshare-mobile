import { beforeEach, describe, expect, test, vi } from "vitest";

const { sql } = vi.hoisted(() => ({ sql: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("./db", () => ({ getSql: () => sql }));
import { lexoPreferimet, shtoPreferimin } from "./preferimet";

describe("Preferimet personale", () => {
  beforeEach(() => vi.resetAllMocks());

  test("filtron sipas përdoruesit dhe kthen numrin nga databaza", async () => {
    sql.mockResolvedValue([{ saved: true, count: 3 }]);
    expect(await lexoPreferimet("test-user", "ride-test")).toEqual({ saved: true, count: 3 });
    expect(sql.mock.calls[0].slice(1)).toEqual(["ride-test", "test-user"]);
  });

  test("nuk shkruan nëse udhëtimi mungon", async () => {
    sql.mockResolvedValue([]);
    expect(await shtoPreferimin("test-user", "missing")).toBeNull();
    expect(sql).toHaveBeenCalledTimes(1);
  });

  test("INSERT parametrizohet dhe konflikti nuk krijon kopje", async () => {
    sql.mockResolvedValueOnce([{ id: "ride-test" }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ saved: true, count: 1 }]);
    expect(await shtoPreferimin("test-user", "ride-test")).toEqual({ saved: true, count: 1 });
    expect(sql.mock.calls[1][0].join("?")).toContain("ON CONFLICT (user_id, ride_id) DO NOTHING");
    expect(sql.mock.calls[1].slice(1)).toEqual(["test-user", "ride-test"]);
  });

  test("gabimi para INSERT nuk kryen shkrim", async () => {
    sql.mockRejectedValueOnce(new Error("Refuzim prove para shkrimit"));
    await expect(shtoPreferimin("test-user", "ride-test")).rejects.toThrow();
    expect(sql).toHaveBeenCalledTimes(1);
  });
});
