// Ported from Reactive Resume (packages/pdf/src/templates/shared/contact.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

type WebsiteDisplay = {
	url: string;
	label?: string | undefined;
};

type CustomFieldLink = {
	link?: string | undefined;
};

export const getWebsiteDisplayText = (website: WebsiteDisplay): string => {
	const label = website.label?.trim();

	return label || website.url;
};

export const getCustomFieldLinkUrl = (field: CustomFieldLink): string | undefined => {
	const link = field.link?.trim();

	return link || undefined;
};
