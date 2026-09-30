import type { Node, Root } from "fumadocs-core/page-tree";
import { SidebarLink } from "./sidebar-link";
import { SidebarMotion } from "./sidebar-motion";

interface Group {
	label?: string;
	nodes: Node[];
}

/** Separators start groups, so the flat tree reads as labelled sections. */
function groups(nodes: Node[]): Group[] {
	return nodes.reduce<Group[]>((result, node) => {
		if (node.type === "separator") result.push({ label: String(node.name ?? ""), nodes: [] });
		else if (result.length === 0) result.push({ nodes: [node] });
		else result[result.length - 1].nodes.push(node);
		return result;
	}, []);
}

function Nodes({ nodes }: { nodes: Node[] }) {
	return (
		<ul className="flex flex-col">
			{nodes.map((node, index) => {
				if (node.type === "page") {
					return (
						<li key={node.url}>
							<SidebarLink href={node.url}>{node.name}</SidebarLink>
						</li>
					);
				}
				if (node.type === "folder") {
					return (
						<li key={node.$id ?? index} className="mt-2">
							{node.index ? (
								<SidebarLink href={node.index.url}>{node.name}</SidebarLink>
							) : (
								<p className="px-3 py-1.5 text-[13px] text-foreground">{node.name}</p>
							)}
							<div className="ml-3 pl-1">
								<Nodes nodes={node.children} />
							</div>
						</li>
					);
				}
				return null;
			})}
		</ul>
	);
}

export function SidebarTree({ tree }: { tree: Root }) {
	return (
		<SidebarMotion>
			<div className="flex flex-col gap-6">
				{groups(tree.children).map((group, index) => (
					<div key={`${group.label}-${index}`}>
						{group.label && <p className="mb-1.5 px-3 text-xs font-medium text-muted-foreground/70">{group.label}</p>}
						<Nodes nodes={group.nodes} />
					</div>
				))}
			</div>
		</SidebarMotion>
	);
}
