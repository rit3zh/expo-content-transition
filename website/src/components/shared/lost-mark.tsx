"use client";

import { useEffect, useState } from "react";
import { NumericText } from "@/components/numeric-text/numeric-text";

/** "404", rolled into place from zeros by the library itself. */
export function LostMark() {
	const [value, setValue] = useState("000");
	useEffect(() => {
		const timer = setTimeout(() => setValue("404"), 450);
		return () => clearTimeout(timer);
	}, []);
	return (
		<NumericText
			value={value}
			fontSize={132}
			fontWeight="800"
			duration={900}
			bounce={0.55}
			monospacedDigits
			className="tracking-tighter text-foreground"
			aria-label="404"
		/>
	);
}
