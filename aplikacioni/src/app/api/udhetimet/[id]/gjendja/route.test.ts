import { beforeEach, expect, test, vi } from "vitest";

const { session, read, send, accept } = vi.hoisted(() => ({
  session: vi.fn(), read: vi.fn(), send: vi.fn(), accept: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession: session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/kerkesat", () => ({ lexoGjendjen: read, dergoKerkesen: send, pranoKerkesen: accept }));
import { GET, POST } from "./route";

const context = { params: Promise.resolve({ id: "test-ride" }) };
const url = "http://localhost:3000/api/udhetimet/test-ride/gjendja";
const post = (body: unknown, origin = "http://localhost:3000") => POST(new Request(url, {
  method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body),
}), context);
beforeEach(() => {
  vi.resetAllMocks();
  session.mockResolvedValue({ user: { githubId: "session-user" } });
});

test("anonimi nuk lexon ose shkruan", async () => {
  session.mockResolvedValue(null);
  expect((await GET(new Request(url), context)).status).toBe(401);
  expect((await post({ action: "request" })).status).toBe(401);
  expect(read).not.toHaveBeenCalled();
  expect(send).not.toHaveBeenCalled();
});
test("leximi është privat dhe nuk shkruan", async () => {
  read.mockResolvedValue({ driver: false, requests: [] });
  const response = await GET(new Request(url), context);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(read).toHaveBeenCalledWith("session-user", "test-ride");
  expect(send).not.toHaveBeenCalled();
  expect(accept).not.toHaveBeenCalled();
  expect((await GET(new Request(url + "?driver=1"), context)).status).toBe(403);
});
test("identiteti vjen vetëm nga sesioni dhe refuzohet origjina e huaj", async () => {
  send.mockResolvedValue(true);
  expect((await post({ action: "request", passenger_id: "forged" })).status).toBe(200);
  expect(send).toHaveBeenCalledWith("session-user", "test-ride");
  expect((await post({ action: "request" }, "https://other.example")).status).toBe(403);
  expect(send).toHaveBeenCalledTimes(1);
});
test("zero vende dhe mungesa e pronësisë nuk raportohen si sukses", async () => {
  accept.mockResolvedValueOnce("full").mockResolvedValueOnce("forbidden");
  expect((await post({ action: "accept", requestId: "1" })).status).toBe(409);
  expect((await post({ action: "accept", requestId: "1" })).status).toBe(403);
  expect((await post({ action: "accept", requestId: "bad" })).status).toBe(400);
});
test("host-i lokal pranohet edhe kur serveri dëgjon në 0.0.0.0", async () => {
  send.mockResolvedValue(true);
  const response = await POST(new Request(url.replace("localhost", "0.0.0.0"), {
    method: "POST", headers: { origin: "http://localhost:3000", host: "localhost:3000" },
    body: JSON.stringify({ action: "request" }),
  }), context);
  expect(response.status).toBe(200);
});
test("gabimet e databazës nuk zbulojnë sekretet", async () => {
  read.mockRejectedValue(new Error("secret"));
  const response = await GET(new Request(url), context);
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("secret");
});
