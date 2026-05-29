import type { ExtensionAPI, SessionEntry } from "@earendil-works/pi-coding-agent";
import { spawn } from "node:child_process";

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

async function commandExists(command: string): Promise<boolean> {
	return await new Promise((resolve) => {
		const child = spawn("command", ["-v", command], { shell: true, stdio: "ignore" });
		child.on("error", () => resolve(false));
		child.on("close", (code) => resolve(code === 0));
	});
}

async function copyToClipboard(text: string): Promise<string> {
	const candidates = process.platform === "darwin"
		? [{ command: "pbcopy", args: [] }]
		: [
			{ command: "wl-copy", args: [] },
			{ command: "xclip", args: ["-selection", "clipboard"] },
			{ command: "xsel", args: ["--clipboard", "--input"] },
		];

	for (const candidate of candidates) {
		if (!(await commandExists(candidate.command))) continue;

		await new Promise<void>((resolve, reject) => {
			const child = spawn(candidate.command, candidate.args, { stdio: ["pipe", "ignore", "pipe"] });
			let stderr = "";

			child.stderr.on("data", (chunk) => (stderr += chunk));
			child.on("error", reject);
			child.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error(stderr.trim() || `${candidate.command} exited with code ${code}`));
			});

			child.stdin.end(text);
		});

		return candidate.command;
	}

	throw new Error("No clipboard command found (tried pbcopy, wl-copy, xclip, xsel)");
}

export default function (pi: ExtensionAPI) {
	const copyLastResponse = async (ctx: {
		hasUI: boolean;
		isIdle(): boolean;
		sessionManager: { getBranch(): SessionEntry[] };
		ui: { notify(message: string, level: "info" | "warning" | "error"): void };
	}) => {
		if (!ctx.hasUI) {
			ctx.ui.notify("copy-last-response requires interactive mode", "error");
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

		try {
			const clipboardCommand = await copyToClipboard(text);
			ctx.ui.notify(`Copied last response with ${clipboardCommand}`, "info");
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			ctx.ui.notify(`Failed to copy last response: ${message}`, "error");
		}
	};

	pi.registerCommand("copy-last-response", {
		description: "Copy the last assistant response to the clipboard",
		handler: async (_args, ctx) => {
			await ctx.waitForIdle();
			await copyLastResponse(ctx);
		},
	});

	pi.registerShortcut("ctrl+alt+c", {
		description: "Copy the last assistant response to the clipboard",
		handler: async (ctx) => {
			await copyLastResponse(ctx);
		},
	});
}
