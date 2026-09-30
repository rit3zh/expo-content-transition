import { Fragment } from "react";
import { PropInfo } from "./prop-info";
import { PROP_TABLES, type PropRow, type PropTableName } from "@/lib/props";

/** Backticks become code; the rest stays text. */
function Inline({ text }: { text: string }) {
	return (
		<>
			{text.split(/(`[^`]+`)/g).map((part, index) =>
				part.startsWith("`") ? (
					<code key={index} className="rounded-[5px] bg-accent px-1 py-px font-mono text-[0.9em] text-foreground">
						{part.slice(1, -1)}
					</code>
				) : (
					<Fragment key={index}>{part}</Fragment>
				),
			)}
		</>
	);
}

// One pill style for every name, type and default.
const PILL = "rounded-md bg-accent px-2 py-0.5 font-mono text-[12.5px] text-foreground/85";

/**
 * Props as a three-column table (prop, type, default), each value in a code
 * pill; a prop's description opens from the info button beside its name. On
 * a narrow screen the table scrolls sideways rather than squeezing types.
 */
export function PropsTable({ of, only, rows }: { of?: PropTableName; only?: string[]; rows?: PropRow[] }) {
	const all: PropRow[] = rows ?? (of ? PROP_TABLES[of] : []);
	const list = only ? all.filter((row) => only.includes(row.name)) : all;
	return (
		<div className="no-scrollbar my-6 overflow-x-auto rounded-xl border border-border">
			<table className="w-full min-w-[34rem] border-collapse text-left">
				<thead className="border-b border-border bg-surface/60">
					<tr>
						{["Prop", "Type", "Default"].map((label) => (
							<th key={label} scope="col" className="px-4 py-2.5 text-[13px] font-medium text-muted-foreground">
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{list.map((row) => (
						<tr key={row.name} className="border-b border-border align-middle last:border-b-0">
							<td className="px-4 py-3 whitespace-nowrap">
								<span className="flex items-center gap-1">
									<code className={PILL}>
										{row.name}
										{row.required && (
											<span className="text-destructive" aria-label="required">
												*
											</span>
										)}
									</code>
									<PropInfo name={row.name}>
										<Inline text={row.description} />
										{row.platform && (
											<span className="mt-1.5 block text-[12px] text-muted-foreground/80">
												<Inline text={row.platform} />
											</span>
										)}
									</PropInfo>
								</span>
							</td>
							<td className="px-4 py-3">
								<code className={`${PILL} inline-block max-w-[22rem] break-words`}>{row.type}</code>
							</td>
							<td className="px-4 py-3 whitespace-nowrap">
								{row.default ? <code className={PILL}>{row.default}</code> : <span className="text-muted-foreground">–</span>}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
