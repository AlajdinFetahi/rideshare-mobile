import { beforeEach, describe, expect, test, vi } from "vitest";

const { sessionMock, saveMock } = vi.hoisted(() => ({
  sessionMock: vi.fn(), saveMock: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession: sessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/preferimet", () => ({ shtoPreferimin: saveMock }));
import { ruajPreferimin } from "./actions";

describe("Ruajtja e preferimit në server", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionMock.mockResolvedValue({ user: { githubId: "test-user" } });
  });

  test("refuzon kërkesën pa sesion pa prekur databazën", async () => {
    sessionMock.mockResolvedValue(null);
    expect(await ruajPreferimin("ride-test")).toEqual({ ok: false });
    expect(saveMock).not.toHaveBeenCalled();
  });

  test("merr identitetin vetëm nga sesioni", async () => {
    saveMock.mockResolvedValue({ saved: true, count: 4 });
    expect(await ruajPreferimin("ride-test")).toEqual({ ok: true, saved: true, count: 4 });
    expect(saveMock).toHaveBeenCalledWith("test-user", "ride-test");
  });

  test.each(["", " ", "x".repeat(201), null, 2])("refuzon ID të pavlefshme: %s", async (id) => {
    expect(await ruajPreferimin(id as string)).toEqual({ ok: false });
    expect(saveMock).not.toHaveBeenCalled();
  });

  test("refuzon udhëtimin që nuk ekziston", async () => {
    saveMock.mockResolvedValue(null);
    expect(await ruajPreferimin("missing")).toEqual({ ok: false });
  });

  test("fsheh gabimet sensitive dhe lejon riprovimin", async () => {
    saveMock.mockRejectedValueOnce(new Error("secret connection string"));
    expect(await ruajPreferimin("ride-test")).toEqual({ ok: false });
    saveMock.mockResolvedValue({ saved: true, count: 1 });
    expect(await ruajPreferimin("ride-test")).toEqual({ ok: true, saved: true, count: 1 });
  });
});
