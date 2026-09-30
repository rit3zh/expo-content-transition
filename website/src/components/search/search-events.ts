// Any part of the site can open search by dispatching this on window.
export const OPEN_SEARCH = "docs:open-search";

export const openSearch = () => window.dispatchEvent(new Event(OPEN_SEARCH));

export interface SearchSuggestion {
	title: string;
	url: string;
	section: string;
}
