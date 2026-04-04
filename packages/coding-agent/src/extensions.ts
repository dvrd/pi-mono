/**
 * Lightweight extension types and utilities subpath export.
 *
 * Use `import { ... } from "@mariozechner/pi-coding-agent/extensions"` for
 * extension type guards and definitions without pulling in the full package
 * (which includes cli-highlight, theme system, etc.).
 *
 * This is the recommended import path for packages that only need extension
 * types and utilities (e.g., pi-safeguard).
 */

// Re-export all types from the extension system
export type {
	AgentEndEvent,
	AgentStartEvent,
	AgentToolResult,
	AgentToolUpdateCallback,
	AppKeybinding,
	BashToolCallEvent,
	BeforeAgentStartEvent,
	BeforeProviderRequestEvent,
	BeforeProviderRequestEventResult,
	CompactOptions,
	ContextEvent,
	ContextUsage,
	CustomToolCallEvent,
	EditToolCallEvent,
	ExecOptions,
	ExecResult,
	Extension,
	ExtensionActions,
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionCommandContextActions,
	ExtensionContext,
	ExtensionContextActions,
	ExtensionError,
	ExtensionEvent,
	ExtensionFactory,
	ExtensionFlag,
	ExtensionHandler,
	ExtensionRuntime,
	ExtensionShortcut,
	ExtensionUIContext,
	ExtensionUIDialogOptions,
	ExtensionWidgetOptions,
	FindToolCallEvent,
	GrepToolCallEvent,
	InputEvent,
	InputEventResult,
	InputSource,
	KeybindingsManager,
	LoadExtensionsResult,
	LsToolCallEvent,
	MessageRenderer,
	MessageRenderOptions,
	ProviderConfig,
	ProviderModelConfig,
	ReadToolCallEvent,
	RegisteredCommand,
	RegisteredTool,
	ResolvedCommand,
	SessionBeforeCompactEvent,
	SessionBeforeForkEvent,
	SessionBeforeSwitchEvent,
	SessionBeforeTreeEvent,
	SessionCompactEvent,
	SessionShutdownEvent,
	SessionStartEvent,
	SessionTreeEvent,
	TerminalInputHandler,
	ToolCallEvent,
	ToolCallEventResult,
	ToolDefinition,
	ToolInfo,
	ToolRenderResultOptions,
	ToolResultEvent,
	TurnEndEvent,
	TurnStartEvent,
	UserBashEvent,
	UserBashEventResult,
	WidgetPlacement,
	WriteToolCallEvent,
} from "./core/extensions/types.js";
// Type guards and helpers
export {
	defineTool,
	isBashToolResult,
	isEditToolResult,
	isFindToolResult,
	isGrepToolResult,
	isLsToolResult,
	isReadToolResult,
	isToolCallEventType,
	isWriteToolResult,
} from "./core/extensions/types.js";

export { wrapRegisteredTool, wrapRegisteredTools } from "./core/extensions/wrapper.js";
