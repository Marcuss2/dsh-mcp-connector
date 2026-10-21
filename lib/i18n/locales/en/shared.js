/**
 * 英文词典分片：shared（跨模块共用的工具与底层文案）。
 *
 * 覆盖 `lib/util.js`、`lib/prompts.js`、`lib/tool-catalog-cache.js`、
 * `lib/probe.js`、`lib/migration.js`、`lib/version-status.js`、
 * `lib/connection-backup.js`、`lib/local-overrides.js` 等没有专属分片的模块。
 *
 * msgid 为中文原文；缺译文时回退中文原文，不会显示空白。
 */
export default {
  '连接显示名不能为空': 'Connection display name cannot be empty',
  '连接显示名不能包含控制字符': 'Connection display name cannot contain control characters',
  '连接显示名不能超过 80 个字符': 'Connection display name cannot exceed 80 characters',
};
