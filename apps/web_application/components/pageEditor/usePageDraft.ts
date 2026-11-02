"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/eden";
import { extractApiMessage } from "@/lib/apiError";
import {
  normalizePageSlug,
  validatePageBlocks,
  validatePageSlug,
  validatePageTheme,
} from "@/server/lib/pages";
import type {
  PageBlockInput,
  PageBlockType,
  PageTheme,
} from "@/server/lib/pages";
import type { PageDTO } from "@/server/services/pages";
import { makeDefaultBlock, nextBlockKey } from "./defaultBlocks";

export type DraftPhase = "loading" | "idle" | "saving" | "error";

const AUTOSAVE_DELAY_MS = 1200;

const pageLoadInflight = new Map<string, Promise<PageDTO>>();

async function requestPageOnce(pageId: string): Promise<PageDTO> {
  const running = pageLoadInflight.get(pageId);
  if (running) return running;
  const request = (async () => {
    const res = await api.pages({ id: pageId }).get();
    if (res.data && "page" in res.data && res.data.page) {
      return res.data.page as unknown as PageDTO;
    }
    throw new Error(extractApiMessage(res, "Page not found."));
  })();
  pageLoadInflight.set(pageId, request);
  try {
    return await request;
  } finally {
    if (pageLoadInflight.get(pageId) === request) pageLoadInflight.delete(pageId);
  }
}

function dropPageLoadCache(pageId: string): void {
  pageLoadInflight.delete(pageId);
}

function renumber(blocks: PageBlockInput[]): PageBlockInput[] {
  return blocks.map((block, index) => ({ ...block, position: index }));
}

function snapshotOf(title: string, theme: PageTheme, blocks: PageBlockInput[]) {
  return JSON.stringify({ title, theme, blocks });
}

export interface UsePageDraft {
  page: PageDTO | null;
  loadError: string | null;
  reload: () => void;
  title: string;
  setTitle: (title: string) => void;
  slug: string;
  commitSlug: (slug: string) => Promise<{ ok: boolean; message?: string }>;
  publish: () => Promise<{ ok: boolean; message?: string }>;
  unpublish: () => Promise<{ ok: boolean; message?: string }>;
  theme: PageTheme;
  patchTheme: (patch: Partial<PageTheme>) => void;
  blocks: PageBlockInput[];
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;
  selectedBlock: PageBlockInput | null;
  addBlock: (type: PageBlockType) => void;
  updateBlockProps: (key: string, props: Record<string, unknown>) => void;
  patchBlock: (key: string, patch: Partial<PageBlockInput>) => void;
  removeBlock: (key: string) => void;
  duplicateBlock: (key: string) => void;
  toggleBlock: (key: string) => void;
  moveBlock: (key: string, delta: -1 | 1) => void;
  reorderBlock: (fromKey: string, toKey: string) => void;
  phase: DraftPhase;
  dirty: boolean;
  statusMessage: string | null;
  lastSavedAt: Date | null;
}

export function usePageDraft(pageId: string): UsePageDraft {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [theme, setTheme] = useState<PageTheme>({
    header: "#FFFFFF",
    card: "#FFFFFF",
    accent: "#EA580C",
    dark: false,
  });
  const [blocks, setBlocks] = useState<PageBlockInput[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [phase, setPhase] = useState<DraftPhase>("loading");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");

  const stateRef = useRef({ title, theme, blocks });
  const savingRef = useRef(false);
  const queuedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = { title, theme, blocks };
  }, [title, theme, blocks]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setPhase("loading");
      setLoadError(null);
      try {
        const loadedPage = await requestPageOnce(pageId);
        if (cancelled) return;
        const numbered = renumber(
          loadedPage.blocks.map((block) => ({
            key: block.key,
            position: block.position,
            visible: block.visible,
            props: block.props,
            type: block.type as PageBlockType,
          }))
        );
        setPage(loadedPage);
        setTitle(loadedPage.title);
        setSlug(loadedPage.slug);
        setTheme(loadedPage.theme);
        setBlocks(numbered);
        setSavedSnapshot(
          snapshotOf(loadedPage.title, loadedPage.theme, numbered)
        );
        setLoaded(true);
        setPhase("idle");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : String(err));
        setPhase("error");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [pageId, reloadToken]);

  const runSave = useCallback(async () => {
    if (savingRef.current) {
      queuedRef.current = true;
      return;
    }
    savingRef.current = true;
    setPhase("saving");
    try {
      for (;;) {
        queuedRef.current = false;
        const snapshot = stateRef.current;
        if (snapshot.title.trim().length === 0) {
          throw new Error("Add a page title to save the draft.");
        }
        const themeErrors = validatePageTheme(snapshot.theme);
        if (themeErrors.length > 0) throw new Error(themeErrors[0]);
        const blockErrors = validatePageBlocks(snapshot.blocks);
        if (blockErrors.length > 0) throw new Error(blockErrors[0]);
        const res = await api.pages({ id: pageId }).patch({
          title: snapshot.title.trim(),
          theme: snapshot.theme,
          blocks: snapshot.blocks.map((block, index) => ({
            key: block.key,
            type: block.type,
            position: index,
            visible: block.visible !== false,
            props: block.props ?? {},
          })),
        });
        if (res.data && "page" in res.data && res.data.page) {
          const saved = res.data.page as unknown as PageDTO;
          setPage(saved);
          setSavedSnapshot(
            snapshotOf(snapshot.title, snapshot.theme, snapshot.blocks)
          );
          setStatusMessage(null);
          setLastSavedAt(new Date());
          setPhase("idle");
        } else {
          throw new Error(extractApiMessage(res, "Could not save the draft."));
        }
        if (!queuedRef.current) break;
        setPhase("saving");
      }
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : String(err));
      setPhase("error");
    } finally {
      savingRef.current = false;
      queuedRef.current = false;
    }
  }, [pageId]);

  useEffect(() => {
    if (!loaded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSave();
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, theme, blocks, loaded, runSave]);

  const dirty = useMemo(
    () => loaded && snapshotOf(title, theme, blocks) !== savedSnapshot,
    [loaded, title, theme, blocks, savedSnapshot]
  );

  const reload = useCallback(() => {
    dropPageLoadCache(pageId);
    setLoaded(false);
    setReloadToken((token) => token + 1);
  }, [pageId]);

  const patchTheme = useCallback((patch: Partial<PageTheme>) => {
    setTheme((current) => ({ ...current, ...patch }));
  }, []);

  const addBlock = useCallback(
    (type: PageBlockType) => {
      setBlocks((current) => {
        const key = nextBlockKey(type, current);
        return [...current, makeDefaultBlock(type, key, current.length)];
      });
      setSelectedKey(nextBlockKey(type, blocks));
    },
    [blocks]
  );

  const updateBlockProps = useCallback(
    (key: string, props: Record<string, unknown>) => {
      setBlocks((current) =>
        current.map((block) =>
          block.key === key ? { ...block, props } : block
        )
      );
    },
    []
  );

  const patchBlock = useCallback((key: string, patch: Partial<PageBlockInput>) => {
    setBlocks((current) =>
      current.map((block) => (block.key === key ? { ...block, ...patch } : block))
    );
  }, []);

  const removeBlock = useCallback(
    (key: string) => {
      setBlocks((current) => renumber(current.filter((b) => b.key !== key)));
      setSelectedKey((current) => (current === key ? null : current));
    },
    []
  );

  const duplicateBlock = useCallback(
    (key: string) => {
      setBlocks((current) => {
        const index = current.findIndex((b) => b.key === key);
        if (index === -1) return current;
        const source = current[index];
        if (!source) return current;
        const copyKey = nextBlockKey(source.type as PageBlockType, current);
        const copy: PageBlockInput = {
          ...source,
          key: copyKey,
          props: JSON.parse(JSON.stringify(source.props ?? {})) as Record<
            string,
            unknown
          >,
        };
        const next = [...current];
        next.splice(index + 1, 0, copy);
        return renumber(next);
      });
    },
    []
  );

  const toggleBlock = useCallback((key: string) => {
    setBlocks((current) =>
      current.map((block) =>
        block.key === key ? { ...block, visible: block.visible === false } : block
      )
    );
  }, []);

  const moveBlock = useCallback((key: string, delta: -1 | 1) => {
    setBlocks((current) => {
      const index = current.findIndex((b) => b.key === key);
      const target = index + delta;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const moving = next[index];
      const other = next[target];
      if (!moving || !other) return current;
      next[index] = other;
      next[target] = moving;
      return renumber(next);
    });
  }, []);

  const reorderBlock = useCallback((fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    setBlocks((current) => {
      const from = current.findIndex((b) => b.key === fromKey);
      const to = current.findIndex((b) => b.key === toKey);
      if (from === -1 || to === -1) return current;
      const next = [...current];
      const [moving] = next.splice(from, 1);
      if (!moving) return current;
      next.splice(to, 0, moving);
      return renumber(next);
    });
  }, []);

  const commitSlug = useCallback(
    async (raw: string): Promise<{ ok: boolean; message?: string }> => {
      const next = normalizePageSlug(raw);
      const invalid = validatePageSlug(next);
      if (invalid) return { ok: false, message: invalid };
      try {
        const res = await api.pages({ id: pageId }).patch({ slug: next });
        if (res.data && "page" in res.data && res.data.page) {
          const saved = res.data.page as unknown as PageDTO;
          setPage(saved);
          setSlug(saved.slug);
          return { ok: true };
        }
        return {
          ok: false,
          message: extractApiMessage(res, "Could not update the URL."),
        };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : String(err),
        };
      }
    },
    [pageId]
  );

  const publish = useCallback(async (): Promise<{
    ok: boolean;
    message?: string;
  }> => {
    try {
      const res = await api.pages({ id: pageId }).publish.post({});
      if (res.data && "page" in res.data && res.data.page) {
        setPage(res.data.page as unknown as PageDTO);
        return { ok: true };
      }
      return {
        ok: false,
        message: extractApiMessage(res, "Could not publish the page."),
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }, [pageId]);

  const unpublish = useCallback(async (): Promise<{
    ok: boolean;
    message?: string;
  }> => {
    try {
      const res = await api.pages({ id: pageId }).unpublish.post({});
      if (res.data && "page" in res.data && res.data.page) {
        setPage(res.data.page as unknown as PageDTO);
        return { ok: true };
      }
      return {
        ok: false,
        message: extractApiMessage(res, "Could not unpublish the page."),
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }, [pageId]);

  const selectedBlock =
    blocks.find((block) => block.key === selectedKey) ?? null;

  return {
    page,
    loadError,
    reload,
    title,
    setTitle,
    slug,
    commitSlug,
    publish,
    unpublish,
    theme,
    patchTheme,
    blocks,
    selectedKey,
    setSelectedKey,
    selectedBlock,
    addBlock,
    updateBlockProps,
    patchBlock,
    removeBlock,
    duplicateBlock,
    toggleBlock,
    moveBlock,
    reorderBlock,
    phase,
    dirty,
    statusMessage,
    lastSavedAt,
  };
}