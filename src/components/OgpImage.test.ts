import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
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

afterAll(() => {
  vi.unstubAllGlobals();
});

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
      // Act
      const result = await getOgImage("Test Title");

      // Assert
      expect(result).toBeInstanceOf(Buffer);
    });

    it("should call satori with correct dimensions", async () => {
      // Arrange
      const satori = (await import("satori")).default;

      // Act
      await getOgImage("Hello World");

      // Assert
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
      // Act
      await getOgImage("Test");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("fonts.googleapis.com"),
        expect.any(Object),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty text", async () => {
      // Act
      const result = await getOgImage("");

      // Assert
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe("Negative Cases", () => {
    it("should handle CSS response that does not match font URL pattern", async () => {
      // Arrange
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve("body { font-family: sans-serif; }"),
      });

      // Act
      const result = await getOgImage("Test Title");

      // Assert
      expect(result).toBeInstanceOf(Buffer);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
