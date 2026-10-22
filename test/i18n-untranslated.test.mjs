import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

import { baselinePath, scanRepository, scanSource, dictionaryRanges, stripComments } from '../scripts/i18n-scan.mjs';

test('扫描结果在 Windows 与 POSIX 使用相同的基线路径键', () => {
  assert.equal(baselinePath('D:\\repo', 'D:\\repo\\lib\\connectors\\json-connector.js', path.win32), 'lib/connectors/json-connector.js');
  assert.equal(baselinePath('/repo', '/repo/lib/connectors/json-connector.js', path.posix), 'lib/connectors/json-connector.js');
});

// URL.pathname retains percent escapes and a leading slash before Windows drives.
const ROOT_URL = new URL('..', import.meta.url);
const ROOT = fileURLToPath(ROOT_URL);

test('扫描根目录使用本机文件路径，保留空格和非 ASCII 目录', () => {
  assert.equal(pathToFileURL(ROOT).href, ROOT_URL.href);
  const encoded = new URL('space%20and%20%E4%B8%AD%E6%96%87/', ROOT_URL);
  const decoded = fileURLToPath(encoded);
  assert.ok(decoded.includes('space and 中文'));
  assert.equal(pathToFileURL(decoded).href, encoded.href);
});
const BASELINE = JSON.parse(
  await readFile(new URL('./fixtures/i18n-untranslated-baseline.json', import.meta.url), 'utf8'),
);

test('面向用户的中文文案必须有 t() 或进入基线，且基线只允许缩小', async () => {
  const hits = await scanRepository(ROOT);
  const byFile = {};
  for (const hit of hits) byFile[hit.file] = (byFile[hit.file] ?? 0) + 1;

  const regressions = [];
  for (const [file, count] of Object.entries(byFile)) {
    const allowed = BASELINE.files[file] ?? 0;
    if (count > allowed) regressions.push(`${file}: ${count} 处未翻译（基线允许 ${allowed}）`);
  }

  assert.deepEqual(
    regressions,
    [],
    `新增了未经过 t() 的中文文案。这些文案会原样显示给英文用户：\n${regressions.join('\n')}\n\n`
    + '请用 t(\'中文原文\') 包裹，并在 lib/i18n/locales/en/ 对应分片补英文译文。',
  );
});

test('基线总量只减不增', async () => {
  const hits = await scanRepository(ROOT);
  assert.ok(
    hits.length <= BASELINE.total,
    `未翻译文案总数从 ${BASELINE.total} 增至 ${hits.length}；基线不允许扩大`,
  );
  if (hits.length < BASELINE.total) {
    // 缩小是好事，但基线必须同步更新，否则「清理干净」永远无法被验证。
    assert.fail(
      `未翻译文案已减少到 ${hits.length}（基线 ${BASELINE.total}）。`
      + '请更新 test/fixtures/i18n-untranslated-baseline.json 以锁定进展。',
    );
  }
});

test('扫描器自身：能识别已翻译、未翻译、注释与词典', () => {
  const source = [
    "const LABELS = Object.freeze({ details: '详情', connect: '连接', send: '发送' });",
    "const a = t('已翻译文案');",
    '// 注释里的中文不算缺陷',
    '/* 块注释里的中文也不算 */',
    "const b = '未翻译文案';",
    "const c = `模板 ${x} 未翻译`;",
    "const d = t('跨行调用', { k: 1 });",
  ].join('\n');
  const hits = scanSource('sample.js', source);
  const texts = hits.map((h) => h.text);
  assert.deepEqual(texts, ['未翻译文案', '模板 ${x} 未翻译']);
});

test('扫描器自身：引号键与标识符键两种词典都能识别', () => {
  // A. 中文键 → 英文值
  const quoted = stripComments(
    "const M = Object.freeze({ '详情': 'Details', '连接': 'Connection', '发送': 'Send' });",
  );
  assert.equal(dictionaryRanges(quoted).length, 1, '中文键词典应被识别');

  // B. 标识符键 → 中文值
  const plain = stripComments(
    "const S = Object.freeze({ a: '未连接', b: '已连接', c: '已停用' });",
  );
  assert.equal(dictionaryRanges(plain).length, 1, '中文值词典应被识别');

  // C. 值是数组的 msgid 容器
  const arrays = stripComments(
    "const G = Object.freeze({ a: ['configuration', 'k', '中文提示', '中文建议'], b: ['transport', 'k2', '另一提示', '另一建议'] });",
  );
  assert.equal(dictionaryRanges(arrays).length, 1, '数组型 msgid 容器应被识别');
});
