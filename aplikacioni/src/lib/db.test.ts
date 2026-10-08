import { afterEach, describe, expect, test, vi } from "vitest";

const { neonMock, sqlClient } = vi.hoisted(() => ({
  neonMock: vi.fn(),
  sqlClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@neondatabase/serverless", () => ({ neon: neonMock }));

import { getSql } from "./db";

describe("getSql", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    vi.clearAllMocks();

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  test("refuzon konfigurimin pa DATABASE_URL", () => {
    delete process.env.DATABASE_URL;

    expect(() => getSql()).toThrow("Databaza nuk është konfiguruar.");
  });

  test("krijon klientin Neon me DATABASE_URL", () => {
    process.env.DATABASE_URL = "postgresql://example.invalid/rideshare";
    neonMock.mockReturnValue(sqlClient);

    expect(getSql()).toBe(sqlClient);
    expect(neonMock).toHaveBeenCalledWith(
      "postgresql://example.invalid/rideshare",
    );
  });
});
