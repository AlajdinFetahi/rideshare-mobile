import { beforeEach, expect, test, vi } from "vitest";

const { session, read, open } = vi.hoisted(() => ({
  session: vi.fn(), read: vi.fn(), open: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession: session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/njoftimet", () => ({ lexoNjoftimet: read, hapNjoftimin: open }));
import { GET, POST } from "./route";

const url = "http://localhost:3000/api/njoftimet";
const post = (body: unknown, origin = "http://localhost:3000") => POST(new Request(url, {
  method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body),
}));
beforeEach(() => {
  vi.resetAllMocks();
  session.mockResolvedValue({ user: { githubId: "passenger" } });
  read.mockResolvedValue({ notifications: [], unreadCount: 0 });
});

test("anonimi nuk merr ose ndryshon njoftime", async () => {
  session.mockResolvedValue(null);
  expect((await GET()).status).toBe(401);
  expect((await post({ id: "1" })).status).toBe(401);
  expect(read).not.toHaveBeenCalled();
  expect(open).not.toHaveBeenCalled();
});

test("GET lexon vetëm identitetin e sesionit, pa shkrime ose cache publik", async () => {
  const response = await GET();
  expect(read).toHaveBeenCalledWith("passenger");
  expect(open).not.toHaveBeenCalled();
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("vary")).toBe("Cookie");
});

test("ID e huaj refuzohet dhe nuk lexohet historia pas saj", async () => {
  open.mockResolvedValue(null);
  expect((await post({ id: "9", recipient_id: "other" })).status).toBe(404);
  expect(open).toHaveBeenCalledWith("passenger", "9");
  expect(read).not.toHaveBeenCalled();
});

test("rruga dhe numri kthehen nga serveri vetëm pas konfirmimit", async () => {
  const detail = { request_id: "3", ride_id: "ride", status: "accepted" };
  open.mockResolvedValue(detail);
  const response = await post({ id: "1", url: "https://evil.example", request_id: "99" });
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ detail, notifications: [], unreadCount: 0 });
  expect(open).toHaveBeenCalledWith("passenger", "1");
});

test("origjina dhe ID e pavlefshme nuk shkaktojnë shkrime", async () => {
  expect((await post({ id: "1" }, "https://evil.example")).status).toBe(403);
  for (const id of ["0", "-1", "1 OR 1=1", "9999999999999999999", 1, null]) {
    expect((await post({ id })).status).toBe(400);
  }
  expect(open).not.toHaveBeenCalled();
});

test("dështimi i ruajtjes nuk raportohet si lexim i suksesshëm", async () => {
  open.mockRejectedValue(new Error("database secret"));
  const response = await post({ id: "1" });
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("secret");
  expect(read).not.toHaveBeenCalled();
});
