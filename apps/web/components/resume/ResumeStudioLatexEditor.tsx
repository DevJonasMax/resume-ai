"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	CheckmarkCircle02Icon,
	Copy01Icon,
	FileCodeIcon,
	FloppyDiskIcon,
	NoteEditIcon,
	ReloadIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import type { ResumeDocument } from "@resume-ai/types";
import { useResumeStudio } from "./ResumeStudioContext";

export function ResumeStudioLatexEditor() {
	const {
		editedLatex,
		setEditedLatex,
		isLatexDirty,
		isSaving,
		saveLatex,
		saveDocument,
		resume,
		candidate,
		activeProvider,
	} = useResumeStudio();

	const [copied, setCopied] = useState(false);
	const [providerSource, setProviderSource] = useState<string>("");
	const [isLoadingSource, setIsLoadingSource] = useState<boolean>(false);
	const lineNumbersRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Load provider-specific source code or structured representation
	useEffect(() => {
		let isCancelled = false;

		if (activeProvider === "typst") {
			setIsLoadingSource(true);
			apiClient
				.getResumeSource(resume.id, { provider: "typst" })
				.then((res) => {
					if (!isCancelled && res?.source) {
						setProviderSource(res.source);
					}
				})
				.catch(() => {
					if (!isCancelled) {
						setProviderSource("// Failed to load Typst source from server.");
					}
				})
				.finally(() => {
					if (!isCancelled) {
						setIsLoadingSource(false);
					}
				});
		} else if (activeProvider === "react-pdf") {
			const canonicalDoc: ResumeDocument = resume.resumeData || {
				basics: {
					fullName: candidate?.fullName || "Candidate",
					email: candidate?.email || "candidate@example.com",
					phone: candidate?.phone || "",
					location: candidate?.location || "",
				},
				summary: resume.tailoredSummary,
				experiences: resume.tailoredExperience,
				skills: candidate?.skills
					? Object.entries(candidate.skills).map(([category, items]) => ({
							category,
							items,
						}))
					: [],
				education: candidate?.education || [],
			};
			setProviderSource(JSON.stringify(canonicalDoc, null, 2));
			setIsLoadingSource(false);
		} else {
			// Legacy LaTeX provider
			setProviderSource(editedLatex);
			setIsLoadingSource(false);
		}

		return () => {
			isCancelled = true;
		};
	}, [
		activeProvider,
		resume.id,
		resume.resumeData,
		resume.tailoredSummary,
		resume.tailoredExperience,
		candidate,
		editedLatex,
	]);

	const displayedContent =
		activeProvider === "latex" ? editedLatex : providerSource;

	const lines = displayedContent.split("\n");
	const lineCount = lines.length;

	const handleCopy = async () => {
		await navigator.clipboard.writeText(displayedContent);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleResetToSource = () => {
		if (activeProvider === "latex") {
			if (
				confirm(
					"Reset current editor contents back to original version source?",
				)
			) {
				setEditedLatex(resume.latexSource);
			}
		}
	};

	const handleScroll = () => {
		if (textareaRef.current && lineNumbersRef.current) {
			lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
		}
	};

	const handleGutterWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		if (textareaRef.current) {
			textareaRef.current.scrollTop += e.deltaY;
		}
	};

	const handleTextareaKeyDown = (
		e: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if (e.key === "Tab") {
			e.preventDefault();
			const textarea = textareaRef.current;
			if (!textarea) return;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const newValue =
				displayedContent.substring(0, start) +
				"  " +
				displayedContent.substring(end);

			if (activeProvider === "latex") {
				setEditedLatex(newValue);
			} else {
				setProviderSource(newValue);
			}

			requestAnimationFrame(() => {
				textarea.selectionStart = textarea.selectionEnd = start + 2;
			});
		}
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const val = e.target.value;
		if (activeProvider === "latex") {
			setEditedLatex(val);
		} else {
			setProviderSource(val);
		}
	};

	// Keyboard shortcut: Ctrl+S / Cmd+S to save
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				if (activeProvider === "latex" && isLatexDirty && !isSaving) {
					saveLatex();
				} else if (activeProvider === "react-pdf" && !isSaving) {
					try {
						const parsed = JSON.parse(providerSource) as ResumeDocument;
						saveDocument(parsed);
					} catch {
						// Invalid JSON
					}
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		activeProvider,
		isLatexDirty,
		isSaving,
		saveLatex,
		saveDocument,
		providerSource,
	]);

	// Provider-specific file label & description
	const fileInfo =
		activeProvider === "typst"
			? { name: "resume.typ", label: "Typst Source", lang: "Typst 0.15" }
			: activeProvider === "react-pdf"
				? {
						name: "resume.json",
						label: "ResumeDocument",
						lang: "Canonical JSON",
					}
				: {
						name: "resume.tex",
						label: "LaTeX 2e",
						lang: "LaTeX (Deprecated Legacy)",
					};

	return (
		<div className="flex flex-col h-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#121417] overflow-hidden shadow-lg">
			{/* Editor Column Header */}
			<div className="flex items-center justify-between px-4 py-2.5 bg-[#181b1f] border-b border-[rgba(255,255,255,0.06)] shrink-0">
				<div className="flex items-center gap-2">
					<HugeiconsIcon
						icon={FileCodeIcon}
						size={15}
						className="text-[#93c5fd]"
					/>
					<span className="text-xs font-mono font-bold text-white tracking-wide">
						{fileInfo.name}
					</span>
					<Badge
						variant="outline"
						className="text-[10px] uppercase font-mono text-[#a7f3d0] border-[#a7f3d0]/30"
					>
						{fileInfo.label}
					</Badge>
					<span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
						{lineCount} lines • {displayedContent.length} chars
					</span>
					{activeProvider === "latex" && isLatexDirty ? (
						<Badge variant="apricot" className="text-[10px]">
							Unsaved
						</Badge>
					) : (
						<Badge variant="outline" className="text-[10px] text-zinc-500">
							Synced
						</Badge>
					)}
				</div>

				<div className="flex items-center gap-1.5">
					{activeProvider === "latex" && isLatexDirty && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleResetToSource}
							title="Reset to generated source"
							className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white"
						>
							<HugeiconsIcon icon={ReloadIcon} size={12} className="mr-1" />
							Reset
						</Button>
					)}

					<Button
						variant="ghost"
						size="sm"
						onClick={handleCopy}
						className="h-7 px-2.5 text-[11px] text-zinc-300 hover:text-white"
					>
						{copied ? (
							<>
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									size={12}
									className="text-[#a7f3d0] mr-1"
								/>
								<span>Copied</span>
							</>
						) : (
							<>
								<HugeiconsIcon icon={Copy01Icon} size={12} className="mr-1" />
								<span>Copy</span>
							</>
						)}
					</Button>

					{activeProvider === "latex" && (
						<Button
							variant={isLatexDirty ? "apricot" : "secondary"}
							size="sm"
							onClick={saveLatex}
							disabled={isSaving || !isLatexDirty}
							className="h-7 px-3 text-[11px] font-semibold"
						>
							<HugeiconsIcon icon={FloppyDiskIcon} size={12} className="mr-1" />
							<span>{isSaving ? "Saving..." : "Save"}</span>
						</Button>
					)}

					{activeProvider === "react-pdf" && (
						<Button
							variant="secondary"
							size="sm"
							onClick={() => {
								try {
									const parsed = JSON.parse(providerSource) as ResumeDocument;
									saveDocument(parsed);
								} catch {
									alert("Invalid JSON format. Please correct before saving.");
								}
							}}
							disabled={isSaving}
							className="h-7 px-3 text-[11px] font-semibold text-[#a7f3d0]"
						>
							<HugeiconsIcon icon={FloppyDiskIcon} size={12} className="mr-1" />
							<span>{isSaving ? "Saving..." : "Save Document"}</span>
						</Button>
					)}
				</div>
			</div>

			{/* Editor Body: Line numbers + Textarea */}
			<div className="relative flex flex-1 min-h-0 h-full w-full overflow-hidden font-mono text-xs bg-[#0c0d0e]">
				{isLoadingSource && (
					<div className="absolute inset-0 bg-[#0c0d0e]/80 flex items-center justify-center z-10 text-xs text-zinc-400 font-mono">
						Loading {activeProvider} source...
					</div>
				)}

				{/* Line numbers gutter */}
				<div
					ref={lineNumbersRef}
					aria-hidden="true"
					onWheel={handleGutterWheel}
					className="w-12 py-3 pr-3 pl-2 text-right text-zinc-500 bg-[#0e1012] border-r border-[rgba(255,255,255,0.06)] overflow-hidden shrink-0"
				>
					{Array.from({ length: lineCount }, (_, i) => (
						<div
							key={i + 1}
							className="h-6 leading-6 text-[11px] font-mono"
							style={{ height: "24px", lineHeight: "24px" }}
						>
							{i + 1}
						</div>
					))}
				</div>

				{/* Textarea code surface */}
				<textarea
					ref={textareaRef}
					value={displayedContent}
					onChange={handleContentChange}
					onScroll={handleScroll}
					onKeyDown={handleTextareaKeyDown}
					readOnly={activeProvider === "typst"}
					spellCheck={false}
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
					className="flex-1 min-w-0 h-full w-full p-3 bg-transparent text-zinc-200 outline-none resize-none font-mono text-[12px] whitespace-pre overflow-auto selection:bg-[#93c5fd]/20 selection:text-[#93c5fd] focus:outline-none"
					style={{ lineHeight: "24px" }}
				/>
			</div>

			{/* Footer Info bar */}
			<div className="flex items-center justify-between px-3 py-1.5 bg-[#181b1f] border-t border-[rgba(255,255,255,0.06)] text-[11px] text-zinc-500 font-mono shrink-0">
				<span className="flex items-center gap-1.5">
					<HugeiconsIcon
						icon={NoteEditIcon}
						size={12}
						className="text-zinc-400"
					/>
					<span>{fileInfo.lang} • UTF-8</span>
				</span>
				<span>
					{activeProvider === "typst"
						? "Generated from canonical ResumeDocument"
						: "Ctrl+S to save"}
				</span>
			</div>
		</div>
	);
}
