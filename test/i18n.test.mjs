import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  normalizeLocale,
  isSupportedLocale,
  resolveLocale,
  interpolate,
  createTranslator,
} from '../lib/i18n/index.js';
import { EN_DICTIONARY, mergeDictionaries } from '../lib/i18n/locales/en.js';

test('支持的语言集合固定为中英，默认语言保持中文', () => {
  assert.equal(DEFAULT_LOCALE, 'zh-CN');
  assert.deepEqual([...SUPPORTED_LOCALES], ['zh-CN', 'en']);
  assert.deepEqual({ ...LOCALE_LABELS }, { 'zh-CN': '中文', en: 'English' });
});

test('语言标签归一化覆盖大小写、下划线与区域子标签', () => {
  for (const value of ['zh', 'zh-CN', 'zh_CN', 'zh-Hans-CN', 'ZH-cn', '  zh  ']) {
    assert.equal(normalizeLocale(value), 'zh-CN', value);
  }
  for (const value of ['en', 'EN', 'en-US', 'en_GB', 'en-Latn-US']) {
    assert.equal(normalizeLocale(value), 'en', value);
  }
  for (const value of ['fr', 'de-DE', 'ja', '', '   ', null, undefined, 42, {}, []]) {
    assert.equal(normalizeLocale(value), undefined, String(value));
  }
  assert.equal(isSupportedLocale('en'), true);
  assert.equal(isSupportedLocale('zh'), false, '未归一化的标签不算支持');
});

test('配置解析：显式语言优先，auto 才看 Host 与环境，未知语言回退中文', () => {
  const env = { LANG: 'en_US.UTF-8' };
  // 显式选择不受环境变量影响：这是中文优先产品的默认安全值。
  assert.equal(resolveLocale('zh-CN', { env }), 'zh-CN');
  assert.equal(resolveLocale('zh', { env: { LANG: 'zh_CN.UTF-8' } }), 'zh-CN');
  assert.equal(resolveLocale('en', { env: { LANG: 'zh_CN.UTF-8' } }), 'en');
  // auto：Host 优先，其次 LC_ALL → LC_MESSAGES → LANG。
  assert.equal(resolveLocale('auto', { env }), 'en');
  assert.equal(resolveLocale('auto', { env: { LANG: 'zh_CN.UTF-8' } }), 'zh-CN');
  assert.equal(resolveLocale('auto', { hostLocale: 'en-US', env: { LANG: 'zh_CN.UTF-8' } }), 'en');
  assert.equal(resolveLocale('auto', { env: { LC_ALL: 'fr_FR', LANG: 'zh_CN.UTF-8' } }), 'zh-CN');
  assert.equal(resolveLocale('auto', { env: { LC_MESSAGES: 'en_GB', LANG: 'zh_CN.UTF-8' } }), 'en');
  // 未知 / 缺失 / C locale 一律回退中文默认。
  assert.equal(resolveLocale('auto', { env: {} }), 'zh-CN');
  assert.equal(resolveLocale('auto', { env: { LANG: 'fr_FR.UTF-8' } }), 'zh-CN');
  assert.equal(resolveLocale('fr', { env }), 'zh-CN');
  assert.equal(resolveLocale(undefined, { env }), 'zh-CN');
  assert.equal(resolveLocale('', { env }), 'zh-CN');
  assert.equal(resolveLocale(null, { env }), 'zh-CN');
});

test('占位符插值只替换已提供字段，缺失占位符保留字面量', () => {
  assert.equal(interpolate('已启用 {name}', { name: 'qcc' }), '已启用 qcc');
  assert.equal(interpolate('{a} 与 {b}', { a: 1, b: 2 }), '1 与 2');
  assert.equal(interpolate('缺 {missing}', {}), '缺 {missing}');
  assert.equal(interpolate('缺 {missing}', { missing: null }), '缺 {missing}');
  assert.equal(interpolate('缺 {missing}', { missing: undefined }), '缺 {missing}');
  assert.equal(interpolate('{name} {name}', { name: 'x' }), 'x x');
  assert.equal(interpolate('无占位符', { name: 'x' }), '无占位符');
  assert.equal(interpolate('{value}', { value: 0 }), '0', '0 与 false 是有效值');
  assert.equal(interpolate('{value}', { value: false }), 'false');
  assert.equal(interpolate('不该注入 {a}', { a: '<img onerror=x>' }), '不该注入 <img onerror=x>',
    '插值不做转义：调用方负责在写入 HTML 前转义');
  assert.equal(interpolate('', { a: 1 }), '');
  assert.equal(interpolate('原样'), '原样');
  assert.equal(interpolate('原样', null), '原样');
});

test('中文 translator 不做查表：msgid 即原文，缺词典也不影响中文界面', () => {
  const t = createTranslator('zh-CN');
  assert.equal(t.locale, 'zh-CN');
  assert.equal(t('已连接'), '已连接');
  assert.equal(t('已启用 "{name}"', { name: 'qcc' }), '已启用 "qcc"');
  assert.equal(t.missing('任意中文'), false, '中文永不缺译文');
  // 未归一化的标签也能工作。
  assert.equal(createTranslator('zh').locale, 'zh-CN');
  assert.equal(createTranslator('fr').locale, 'zh-CN', '不支持的语言回退中文');
  assert.equal(createTranslator(undefined).locale, 'zh-CN');
});

test('英文 translator 查表，缺失时回退中文原文而不是空串或 key', () => {
  const t = createTranslator('en', { en: { '已连接': 'Connected', '已启用 "{name}"': 'Enabled "{name}"' } });
  assert.equal(t.locale, 'en');
  assert.equal(t('已连接'), 'Connected');
  assert.equal(t('已启用 "{name}"', { name: 'qcc' }), 'Enabled "qcc"');
  assert.equal(t('没有译文的句子'), '没有译文的句子', '缺译文回退中文原文');
  assert.equal(t.missing('没有译文的句子'), true);
  assert.equal(t.missing('已连接'), false);
  // 没有词典时不会崩：整段回退中文。
  assert.equal(createTranslator('en')('原文'), '原文');
  // 原型链上的键不能被当成译文（避免 constructor / toString 之类的假命中）。
  assert.equal(t('constructor'), 'constructor');
  assert.equal(t('toString'), 'toString');
});

test('英文词典分片合并：重复 msgid 允许，冲突译文直接报错', () => {
  const merged = mergeDictionaries({
    a: { '已连接': 'Connected' },
    b: { '已连接': 'Connected', '目录': 'Catalog' },
  });
  assert.deepEqual({ ...merged }, { '已连接': 'Connected', '目录': 'Catalog' });
  assert.equal(Object.isFrozen(merged), true);
  assert.throws(() => mergeDictionaries({ a: { '已连接': 'Connected' }, b: { '已连接': 'Online' } }),
    /译文不一致/);
  assert.throws(() => mergeDictionaries({ a: { '已连接': '' } }), /译文为空/);
  assert.throws(() => mergeDictionaries({ a: { '已连接': '   ' } }), /译文为空/);
  assert.throws(() => mergeDictionaries({ a: { '已连接': null } }), /译文为空/);
  assert.deepEqual({ ...mergeDictionaries({}) }, {});
  assert.deepEqual({ ...mergeDictionaries({ a: undefined }) }, {});
});

test('已合并的英文词典是扁平字符串映射，且不含空译文', () => {
  assert.equal(Object.isFrozen(EN_DICTIONARY), true);
  for (const [msgid, translation] of Object.entries(EN_DICTIONARY)) {
    assert.equal(typeof msgid, 'string');
    assert.equal(typeof translation, 'string');
    assert.notEqual(translation.trim(), '', msgid);
  }
});
