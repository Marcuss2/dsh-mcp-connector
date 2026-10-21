/**
 * 英文词典分片：validation（`lib/mcp-validation.js` 等连接校验文案）。
 *
 * msgid 为中文原文；缺译文时回退中文原文，不会显示空白。
 */
export default {
  "Key/Token 无效、已过期或当前账号没有该 Server 权限（HTTP {status}）": "The Key/Token is invalid or expired, or the current account lacks permission for this Server (HTTP {status})",
  "Key/Token 无效或没有权限": "The Key/Token is invalid or lacks permission",
  "Key/Token 无效或没有权限：{detail}": "The Key/Token is invalid or lacks permission: {detail}",
  "MCP 初始化失败": "MCP initialization failed",
  "MCP 初始化失败：{detail}": "MCP initialization failed: {detail}",
  "MCP 初始化或首次工具同步失败，请检查服务配置和 Host 日志": "MCP initialization or the first tool synchronization failed; check the service configuration and Host logs",
  "MCP 服务暂时异常（HTTP {status}）": "The MCP service is temporarily unavailable (HTTP {status})",
  "MCP 端点拒绝连接（HTTP {status}）": "The MCP endpoint rejected the connection (HTTP {status})",
  "TLS/网络连接被远端重置，服务可能要求专线、VPN 或来源 IP 白名单": "The TLS/network connection was reset by the remote end; the service may require a dedicated line, VPN, or source IP allowlist",
  "stdio 进程已交由 dsh-mcp-client 托管；工具可用性以 Host 注册结果为准": "The stdio process is managed by dsh-mcp-client; tool availability follows the Host registration result",
  "域名解析失败，请检查当前网络 DNS": "DNS resolution failed; check the DNS settings of the current network",
  "已验证 {count} 个 MCP Server": "Validated {count} MCP Servers",
  "无法连接 MCP 服务，请检查网络和 MCP URL": "Cannot reach the MCP service; check the network and the MCP URL",
  "服务请求过于频繁（HTTP {status}），请稍后重试": "Too many requests to the service (HTTP {status}); try again later",
  "本地 MCP Server 启动或初始化失败，请检查命令、参数、运行环境和 Host 日志": "The local MCP Server failed to start or initialize; check the command, arguments, runtime environment, and Host logs",
  "本地 MCP Server 启动或工具同步超时，请检查运行环境、命令和 Host 日志": "The local MCP Server timed out while starting or synchronizing tools; check the runtime environment, command, and Host logs",
  "本地 MCP 初始化或首次工具同步失败，Host 未提供可识别的具体原因；请检查官方 CLI 状态、启动命令和 Host 日志，不能仅据此判断为授权失败": "Local MCP initialization or the first tool synchronization failed and the Host provided no identifiable cause; check the official CLI status, startup command, and Host logs. This alone does not indicate an authorization failure",
  "本地 MCP 启动命令不存在，请先安装所需运行时或检查 command 配置": "The local MCP startup command does not exist; install the required runtime or check the command configuration",
  "本地 MCP 进程在初始化期间退出（退出码 {code}），请检查命令、参数和 Host 日志": "The local MCP process exited during initialization (exit code {code}); check the command, arguments, and Host logs",
  "本地 MCP 进程在初始化期间退出，请检查命令、参数和 Host 日志": "The local MCP process exited during initialization; check the command, arguments, and Host logs",
  "目标地址可访问，但未返回有效的 MCP 初始化响应": "The target address is reachable but returned no valid MCP initialization response",
  "目标地址未完成 MCP initialize 握手": "The target address did not complete the MCP initialize handshake",
  "目标服务拒绝连接，请检查 MCP URL 和服务状态": "The target service refused the connection; check the MCP URL and service status",
  "连接超时，请检查网络、VPN/专线或服务状态": "The connection timed out; check the network, VPN/dedicated line, or service status",
  "连接验证失败：{summary}{more}。未保存连接，请修正后重试。": "Connection validation failed: {summary}{more}. The connection was not saved; fix the problem and try again.",
  "钉钉待授权：官方 CLI 当前未登录。若已确认企业尚未开放 CLI，请等待管理员处理，无需反复登录、重启或填写 API Key；具备授权条件后再完成官方登录并连接": "DingTalk authorization pending: the official CLI is not signed in. If the organization has not enabled the CLI yet, wait for an administrator; there is no need to sign in repeatedly, restart, or enter an API Key. Complete the official sign-in and connect once authorization is possible",
  "钉钉授权状态未知：官方 CLI 返回异常或不完整响应，请检查 CLI 诊断；不能据此判断为未登录或管理员限制": "DingTalk authorization status unknown: the official CLI returned an abnormal or incomplete response; check the CLI diagnostics. This does not prove a missing sign-in or an administrator restriction",
  "：": ": ",
  "；": "; ",
  "；另有 {count} 个 Server 未通过": "; {count} more Servers failed validation",
};
