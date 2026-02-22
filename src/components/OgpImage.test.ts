import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOgImage } from "./OgpImage";

vi.mock("satori", () => ({
  default: vi.fn(() => "<svg>mock</svg>"),
}));
vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    png: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-png")),
  })),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("getOgImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch
      .mockResolvedValueOnce({
        text: () =>
          Promise.resolve(
            "src: url(https://fonts.example.com/font.ttf) format('truetype')",
          ),
      })
      .mockResolvedValueOnce({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });
  });

  describe("Positive Cases", () => {
    it("should return a Buffer", async () => {
      const result = await getOgImage("Test Title");
      expect(result).toBeInstanceOf(Buffer);
    });

    it("should call satori with correct dimensions", async () => {
      const satori = (await import("satori")).default;
      await getOgImage("Hello World");
      expect(satori).toHaveBeenCalled();
      const firstCallArgs = vi.mocked(satori).mock.calls[0];
      expect(firstCallArgs[1]).toEqual(
        expect.objectContaining({
          width: 800,
          height: 400,
        }),
      );
    });

    it("should fetch Google Fonts API", async () => {
      await getOgImage("Test");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("fonts.googleapis.com"),
        expect.any(Object),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty text", async () => {
      const result = await getOgImage("");
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
