"use client";

import { Children, isValidElement, useState, type ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { cn } from "@/lib/utils";
import { InsideTabs } from "./code-block";

// These four names are what fumadocs' remark-npm and remark-code-tab emit.

function firstTabValue(children: ReactNode): string {
	for (const child of Children.toArray(children)) {
		if (isValidElement<{ value?: string; children?: ReactNode }>(child)) {
			if (child.type === CodeBlockTab && child.props.value) return child.props.value;
			const nested = firstTabValue(child.props.children);
			if (nested) return nested;
		}
	}
	return "";
}

export function CodeBlockTabs({
	defaultValue,
	groupId,
	children,
}: {
	defaultValue?: string;
	groupId?: string;
	persist?: boolean;
	children: ReactNode;
}) {
	const initial = defaultValue ?? firstTabValue(children);
	const [shared, setShared] = usePersistedTab(groupId, initial);
	const [local, setLocal] = useState(initial);
	const value = groupId ? shared : local;

	return (
		<Tabs.Root
			value={value}
			onValueChange={(next) => (groupId ? setShared(String(next)) : setLocal(String(next)))}
			data-code-tabs=""
			className="my-6 overflow-hidden rounded-xl bg-code"
		>
			<InsideTabs.Provider value>{children}</InsideTabs.Provider>
		</Tabs.Root>
	);
}

export function CodeBlockTabsList({ children }: { children: ReactNode }) {
	return (
		<Tabs.List className="no-scrollbar relative flex h-11 items-center gap-1 overflow-x-auto px-2 pt-1">
			{children}
			<Tabs.Indicator className="absolute top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-md bg-background shadow-[0_1px_2px_oklch(0_0_0/0.06)] transition-[left,width] duration-200 ease-out-quart dark:bg-accent" />
		</Tabs.List>
	);
}

export function CodeBlockTabsTrigger({ value, children }: { value: string; children: ReactNode }) {
	return (
		<Tabs.Tab
			value={value}
			className={cn(
				"relative z-10 flex h-7 items-center rounded-md px-2.5 font-mono text-xs text-muted-foreground outline-offset-2 transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid",
				"data-active:text-foreground",
			)}
		>
			{children}
		</Tabs.Tab>
	);
}

export function CodeBlockTab({ value, children }: { value: string; children: ReactNode }) {
	return (
		<Tabs.Panel value={value} className="outline-none">
			{children}
		</Tabs.Panel>
	);
}
