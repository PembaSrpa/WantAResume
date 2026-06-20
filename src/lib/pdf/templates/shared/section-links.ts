// Ported from Reactive Resume (packages/pdf/src/templates/shared/section-links.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

import type { Website } from "../../../schema/data";

type ItemWebsite = Website & {
	inlineLink?: boolean | undefined;
};

export const getInlineItemWebsiteUrl = (website: ItemWebsite): string | undefined => {
	if (!website.url || !website.inlineLink) return undefined;

	return website.url;
};

export const shouldRenderSeparateItemWebsite = (website: ItemWebsite): boolean => {
	return Boolean(website.url && !website.inlineLink);
};
