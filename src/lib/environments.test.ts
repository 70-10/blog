import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("isProduction", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should return true when NODE_ENV is production", async () => {
    // Arrange
    process.env.NODE_ENV = "production";

    // Act
    const { isProduction } = await import("./environments");

    // Assert
    expect(isProduction).toBe(true);
  });

  it("should return false when NODE_ENV is development", async () => {
    // Arrange
    process.env.NODE_ENV = "development";

    // Act
    const { isProduction } = await import("./environments");

    // Assert
    expect(isProduction).toBe(false);
  });

  it("should return false when NODE_ENV is test", async () => {
    // Arrange
    process.env.NODE_ENV = "test";

    // Act
    const { isProduction } = await import("./environments");

    // Assert
    expect(isProduction).toBe(false);
  });

  it("should return false when NODE_ENV is undefined", async () => {
    // Arrange
    delete process.env.NODE_ENV;

    // Act
    const { isProduction } = await import("./environments");

    // Assert
    expect(isProduction).toBe(false);
  });

  it("should return false when NODE_ENV is empty string", async () => {
    // Arrange
    process.env.NODE_ENV = "";

    // Act
    const { isProduction } = await import("./environments");

    // Assert
    expect(isProduction).toBe(false);
  });

  it("should return false for any other NODE_ENV value", async () => {
    // Arrange
    process.env.NODE_ENV = "staging";

    // Act
    const { isProduction } = await import("./environments");

    // Assert
    expect(isProduction).toBe(false);
  });
});
