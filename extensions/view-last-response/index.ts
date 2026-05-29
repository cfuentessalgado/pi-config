import type { ExtensionAPI, SessionEntry } from "@earendil-works/pi-coding-agent";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { Container, Text, type TUI } from "@earendil-works/pi-tui";

class LaunchingEditorComponent extends Container {
	constructor(message: string) {
		super();
		this.addChild(new Text(message));
	}
}

function getLastAssistantText(branch: SessionEntry[]): string | undefined {
	for (let i = branch.length - 1; i >= 0; i--) {
		const entry = branch[i];
		if (entry.type !== "message") continue;

		const msg = entry.message;
		if (!("role" in msg) || msg.role !== "assistant") continue;

		const text = msg.content
			.filter((block): block is { type: "text"; text: string } => block.type === "text")
			.map((block) => block.text)
			.join("\n");

		if (text.trim()) return text;
	}

	return undefined;
}

async function openInExternalEditor(tui: TUI, filePath: string): Promise<void> {
	const editorCmd = process.env.VISUAL || process.env.EDITOR || "vi";
	const [editor, ...editorArgs] = editorCmd.split(" ");

	tui.stop();
	process.stdout.write(`Launching external editor: ${editorCmd}\nPi will resume when the editor exits.\n`);

	try {
		const status = await new Promise<number | null>((resolve) => {
			const child = spawn(editor, [...editorArgs, filePath], {
				stdio: "inherit",
				shell: process.platform === "win32",
			});
			child.on("error", () => resolve(null));
			child.on("close", (code) => resolve(code));
		});

		if (status !== 0) {
			throw new Error(status === null ? "Failed to launch editor" : `Editor exited with code ${status}`);
		}
	} finally {
		tui.start();
		tui.requestRender(true);
	}
}

export default function (pi: ExtensionAPI) {
	const viewLastResponse = async (ctx: {
		hasUI: boolean;
		isIdle(): boolean;
		sessionManager: { getBranch(): SessionEntry[] };
		ui: {
			notify(message: string, level: "info" | "warning" | "error"): void;
			custom<T>(
				render: (tui: TUI, theme: unknown, keybindings: unknown, done: (result: T) => void) => unknown,
			): Promise<T>;
		};
	}) => {
		if (!ctx.hasUI) {
			ctx.ui.notify("view-last-response requires interactive mode", "error");
			return;
		}

		if (!ctx.isIdle()) {
			ctx.ui.notify("Wait for the agent to finish first", "warning");
			return;
		}

		const text = getLastAssistantText(ctx.sessionManager.getBranch());
		if (!text) {
			ctx.ui.notify("No assistant response found", "error");
			return;
		}

		const dir = await mkdtemp(join(tmpdir(), "pi-last-response-"));
		const filePath = join(dir, "last-response.md");

		try {
			await writeFile(filePath, text, "utf8");
			const errorMessage = await ctx.ui.custom<string | null>((tui, _theme, _keybindings, done) => {
				const run = async () => {
					try {
						await openInExternalEditor(tui, filePath);
						done(null);
					} catch (error) {
						done(error instanceof Error ? error.message : String(error));
					}
				};

				void run();
				return new LaunchingEditorComponent("Opening external editor...");
			});

			if (errorMessage) {
				ctx.ui.notify(`Failed to open editor: ${errorMessage}`, "error");
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			ctx.ui.notify(`Failed to open editor: ${message}`, "error");
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	};

	pi.registerCommand("view-last-response", {
		description: "Open the last assistant response in $VISUAL/$EDITOR",
		handler: async (_args, ctx) => {
			await ctx.waitForIdle();
			await viewLastResponse(ctx);
		},
	});

	pi.registerShortcut("ctrl+alt+g", {
		description: "Open the last assistant response in $VISUAL/$EDITOR",
		handler: async (ctx) => {
			await viewLastResponse(ctx);
		},
	});
}
