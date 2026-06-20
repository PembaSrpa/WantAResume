// Ported from Reactive Resume (packages/pdf/src/templates/shared/featured-summary.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

type FeaturedSummaryLayoutInput = {
	sections: string[];
	canFeatureSummary: boolean;
};

type FeaturedSummaryLayout = {
	featuredSummarySection: "summary" | undefined;
	regularSections: string[];
};

export const getFeaturedSummaryLayout = ({
	sections,
	canFeatureSummary,
}: FeaturedSummaryLayoutInput): FeaturedSummaryLayout => {
	const featuredSummarySection = canFeatureSummary && sections.includes("summary") ? "summary" : undefined;

	return {
		featuredSummarySection,
		regularSections: featuredSummarySection ? sections.filter((section) => section !== "summary") : sections,
	};
};
