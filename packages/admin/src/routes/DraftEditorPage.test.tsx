// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTOSAVE_DELAY_MS } from "../hooks/useAutosave";
import * as api from "../lib/api";
import { DraftEditorPage } from "./DraftEditorPage";

// React 19 の act() はこの印を見て動く。立てないと更新が同期されず警告が出る。
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const id = "11111111-2222-4333-8444-555555555555";

let container: HTMLDivElement;
let root: Root;

async function render(path: string) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/drafts/new" element={<DraftEditorPage />} />
          <Route path="/drafts/:id" element={<DraftEditorPage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

function field(label: string) {
  const element = container.querySelector(`[aria-label="${label}"]`);
  return element as HTMLInputElement | HTMLTextAreaElement;
}

async function type(label: string, value: string) {
  const element = field(label);
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function waitDelay() {
  await act(async () => {
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
  });
  await act(async () => {});
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.spyOn(api, "getDraft").mockResolvedValue({
    id,
    title: "残したタイトル",
    body: "残した本文",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    sha: "sha-1",
  });
  vi.spyOn(api, "updateDraft").mockResolvedValue({
    id,
    updatedAt: "2026-08-13T00:00:00.000Z",
    sha: "sha-2",
  });
  vi.spyOn(api, "createDraft").mockResolvedValue({
    id,
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
    sha: "sha-new",
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("DraftEditorPage", () => {
  describe("Positive Cases", () => {
    it("should load the stored title and body", async () => {
      // Act
      await render(`/drafts/${id}`);

      // Assert
      expect(field("タイトル").value).toBe("残したタイトル");
      expect(field("本文").value).toBe("残した本文");
    });

    it("should save once after the input settles", async () => {
      // Arrange
      await render(`/drafts/${id}`);

      // Act
      await type("本文", "書き足した");
      await waitDelay();

      // Assert
      expect(api.updateDraft).toHaveBeenCalledTimes(1);
    });

    it("should create a draft on the first save of a new one", async () => {
      // Arrange
      await render("/drafts/new");

      // Act
      await type("本文", "新しい着想");
      await waitDelay();

      // Assert
      expect(api.createDraft).toHaveBeenCalledWith("", "新しい着想");
      expect(api.updateDraft).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should restart the timer while the user keeps typing", async () => {
      // Arrange
      await render(`/drafts/${id}`);

      // Act
      await type("本文", "あ");
      await act(async () => vi.advanceTimersByTime(1000));
      await type("本文", "あい");
      await act(async () => vi.advanceTimersByTime(1000));
      await type("本文", "あいう");
      await waitDelay();

      // Assert
      expect(api.updateDraft).toHaveBeenCalledTimes(1);
      expect(api.updateDraft).toHaveBeenCalledWith(
        id,
        "残したタイトル",
        "あいう",
        "sha-1",
      );
    });

    it("should not save when the content is unchanged", async () => {
      // Arrange
      await render(`/drafts/${id}`);

      // Act
      await type("本文", "変えた");
      await type("本文", "残した本文");
      await waitDelay();

      // Assert
      expect(api.updateDraft).not.toHaveBeenCalled();
    });

    it("should save immediately when the tab becomes hidden", async () => {
      // Arrange
      await render(`/drafts/${id}`);
      await type("本文", "隠れる前に書いた");

      // Act
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });

      // Assert
      expect(api.updateDraft).toHaveBeenCalledTimes(1);
    });

    it("should save immediately when the input loses focus", async () => {
      // Arrange
      await render(`/drafts/${id}`);
      await type("本文", "離れる前に書いた");

      // Act
      // React の onBlur は native の focusout に対応する（blur は上がってこない）
      await act(async () => {
        field("本文").dispatchEvent(
          new FocusEvent("focusout", { bubbles: true }),
        );
      });

      // Assert
      expect(api.updateDraft).toHaveBeenCalledTimes(1);
    });
  });

  describe("Negative Cases", () => {
    it("should skip saving and report an empty draft", async () => {
      // Arrange
      await render(`/drafts/${id}`);

      // Act
      await type("タイトル", "");
      await type("本文", "   ");
      await waitDelay();

      // Assert
      expect(api.updateDraft).not.toHaveBeenCalled();
      expect(container.textContent).toContain("中身が空なので保存していません");
    });

    it("should report a conflict when the server returns 409", async () => {
      // Arrange
      vi.mocked(api.updateDraft).mockRejectedValue(
        new api.ApiError(409, "他のところで変わっています"),
      );
      await render(`/drafts/${id}`);

      // Act
      await type("本文", "ぶつかる書き込み");
      await waitDelay();

      // Assert
      expect(container.textContent).toContain(
        "他のところで変わっています。読み直してください",
      );
    });

    it("should report a failure for other errors", async () => {
      // Arrange
      vi.mocked(api.updateDraft).mockRejectedValue(
        new api.ApiError(500, "こわれた"),
      );
      await render(`/drafts/${id}`);

      // Act
      await type("本文", "失敗する書き込み");
      await waitDelay();

      // Assert
      expect(container.textContent).toContain("保存できませんでした");
    });
  });
});
