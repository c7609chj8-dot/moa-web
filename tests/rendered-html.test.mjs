import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines production search and sharing metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /metadataBase:\s*new URL/);
  assert.match(layout, /alternates:\s*\{/);
  assert.match(layout, /openGraph:\s*\{/);
  assert.match(layout, /robots:\s*\{/);
  assert.doesNotMatch(layout, /codex-preview/);
});
