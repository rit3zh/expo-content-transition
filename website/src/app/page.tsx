import { Closing } from "@/components/home/closing";
import { ExamplesShowcase } from "@/components/home/examples-showcase";
import { Faq } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { HomeHeader } from "@/components/home/home-header";
import { HowItWorks } from "@/components/home/how-it-works";
import { Platforms } from "@/components/home/platforms";
import { PlaygroundSection } from "@/components/home/playground-section";
import { BottomBlur } from "@/components/layout/page-blur";
import { SiteFooter } from "@/components/layout/site-footer";

export default function Home() {
	return (
		<>
			<HomeHeader />
			<main>
				<Hero />
				<HowItWorks />
				<PlaygroundSection />
				<ExamplesShowcase />
				<Platforms />
				<Faq />
				<Closing />
			</main>
			<SiteFooter />
			<BottomBlur />
		</>
	);
}
