export type Theme = {
	name: string;
	page: string;
	pageColor: string;
	title: string;
	tableWrapper: string;
	thead: string;
	th: string;
	row: string;
	rowBorder: string;
	input: string;
	euro: string;
	pillOn: string;
	pillOff: string;
	deleteBtn: string;
	emptyText: string;
	tfoot: string;
	tfootLabel: string;
	tfootValue: string;
	card: string;
	cardLabel: string;
	cardFieldLabel: string;
	totalBar: string;
	totalLabel: string;
	totalValue: string;
	addBtn: string;
	summaryCard: string;
	summaryName: string;
	summaryLabel: string;
	summaryValue: string;
	summaryPositive: string;
	summaryNegative: string;
	summaryDivider: string;
	settlementCard: string;
	settlementFrom: string;
	settlementArrow: string;
	settlementTo: string;
	settlementAmount: string;
	rowInvalid: string;
	focusRing: string;
	themeBtn: string;
	themeBtnActive: string;
	menuDropdown: string;
	menuItem: string;
	menuItemActive: string;
};

export const themes: Theme[] = [
	{
		name: 'Light',
		page: 'bg-gray-50',
		pageColor: '#f9fafb',
		title: 'text-gray-900',
		tableWrapper: 'border-gray-200 bg-white',
		thead: 'bg-gray-100/60 backdrop-blur-md shadow-[0_1px_0_0_rgb(229,231,235)]',
		th: 'text-gray-700',
		row: 'hover:bg-gray-50',
		rowBorder: 'border-gray-100',
		input: 'border-gray-300 bg-white text-gray-900 focus:border-blue-500',
		euro: 'text-gray-500',
		pillOn: 'border border-blue-500 bg-blue-100 text-blue-800 ring-1 ring-blue-500',
		pillOff: 'border border-gray-300 bg-gray-100 text-gray-500',
		deleteBtn: 'text-red-600 hover:bg-red-50 hover:text-red-700',
		emptyText: 'text-gray-500',
		tfoot: 'border-gray-200 bg-gray-100/60 backdrop-blur-md',
		tfootLabel: 'text-gray-700',
		tfootValue: 'text-gray-900',
		card: 'border-gray-200 bg-white',
		cardLabel: 'text-gray-500',
		cardFieldLabel: 'text-gray-600',
		totalBar: 'border-gray-200 bg-gray-100',
		totalLabel: 'text-gray-700',
		totalValue: 'text-gray-900',
		addBtn: 'bg-blue-600 text-white hover:bg-blue-700',
		summaryCard: 'border-gray-200 bg-white',
		summaryName: 'text-gray-900',
		summaryLabel: 'text-gray-500',
		summaryValue: 'text-gray-700',
		summaryPositive: 'text-green-600',
		summaryNegative: 'text-red-600',
		summaryDivider: 'border-gray-200',
		settlementCard: 'border-gray-200 bg-white',
		settlementFrom: 'text-gray-900',
		settlementArrow: 'text-gray-400',
		settlementTo: 'text-gray-900',
		settlementAmount: 'text-blue-600 bg-blue-50',
		rowInvalid: 'bg-red-50!',
		focusRing: 'focus:ring-blue-500',
		themeBtn: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
		themeBtnActive: 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500',
		menuDropdown: 'bg-white ring-1 ring-black/5 shadow-lg',
		menuItem: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
		menuItemActive: 'bg-gray-100 text-gray-900'
	},
	{
		name: 'Midnight',
		page: 'bg-slate-900',
		pageColor: '#0f172a',
		title: 'text-slate-100',
		tableWrapper: 'border-slate-700 bg-slate-800',
		thead: 'bg-slate-700/60 backdrop-blur-md shadow-[0_1px_0_0_rgb(51,65,85)]',
		th: 'text-slate-300',
		row: 'hover:bg-slate-750 hover:bg-slate-700/50',
		rowBorder: 'border-slate-700',
		input: 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-400',
		euro: 'text-slate-400',
		pillOn: 'border border-blue-400 bg-blue-900 text-blue-300 ring-1 ring-blue-400',
		pillOff: 'border border-slate-600 bg-slate-700 text-slate-400',
		deleteBtn: 'text-red-400 hover:bg-red-900/30 hover:text-red-300',
		emptyText: 'text-slate-500',
		tfoot: 'border-slate-600 bg-slate-700/60 backdrop-blur-md',
		tfootLabel: 'text-slate-300',
		tfootValue: 'text-slate-100',
		card: 'border-slate-700 bg-slate-800',
		cardLabel: 'text-slate-400',
		cardFieldLabel: 'text-slate-400',
		totalBar: 'border-slate-700 bg-slate-700',
		totalLabel: 'text-slate-300',
		totalValue: 'text-slate-100',
		addBtn: 'bg-blue-500 text-white hover:bg-blue-400',
		summaryCard: 'border-slate-700 bg-slate-800',
		summaryName: 'text-slate-100',
		summaryLabel: 'text-slate-400',
		summaryValue: 'text-slate-300',
		summaryPositive: 'text-green-400',
		summaryNegative: 'text-red-400',
		summaryDivider: 'border-slate-700',
		settlementCard: 'border-slate-700 bg-slate-800',
		settlementFrom: 'text-slate-100',
		settlementArrow: 'text-slate-500',
		settlementTo: 'text-slate-100',
		settlementAmount: 'text-blue-300 bg-blue-900/40',
		rowInvalid: 'bg-red-900/20!',
		focusRing: 'focus:ring-blue-400',
		themeBtn: 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700',
		themeBtnActive: 'border-blue-400 bg-blue-900/40 text-blue-300 ring-1 ring-blue-400',
		menuDropdown: 'bg-slate-800 ring-1 ring-white/10 shadow-lg',
		menuItem: 'text-slate-300 hover:bg-slate-700 hover:text-slate-100',
		menuItemActive: 'bg-slate-700 text-slate-100'
	},
	{
		name: 'Pink Pastel',
		page: 'bg-pink-50',
		pageColor: '#fdf2f8',
		title: 'text-pink-900',
		tableWrapper: 'border-pink-200 bg-white',
		thead: 'bg-pink-100/60 backdrop-blur-md shadow-[0_1px_0_0_rgb(251,207,232)]',
		th: 'text-pink-800',
		row: 'hover:bg-pink-50',
		rowBorder: 'border-pink-100',
		input: 'border-pink-300 bg-white text-pink-900 focus:border-pink-500',
		euro: 'text-pink-400',
		pillOn: 'border border-pink-500 bg-pink-200 text-pink-800 ring-1 ring-pink-500',
		pillOff: 'border border-pink-300 bg-pink-50 text-pink-400',
		deleteBtn: 'text-rose-500 hover:bg-rose-50 hover:text-rose-600',
		emptyText: 'text-pink-400',
		tfoot: 'border-pink-200 bg-pink-100/60 backdrop-blur-md',
		tfootLabel: 'text-pink-700',
		tfootValue: 'text-pink-900',
		card: 'border-pink-200 bg-white',
		cardLabel: 'text-pink-400',
		cardFieldLabel: 'text-pink-600',
		totalBar: 'border-pink-200 bg-pink-100',
		totalLabel: 'text-pink-700',
		totalValue: 'text-pink-900',
		addBtn: 'bg-pink-500 text-white hover:bg-pink-600',
		summaryCard: 'border-pink-200 bg-white',
		summaryName: 'text-pink-900',
		summaryLabel: 'text-pink-400',
		summaryValue: 'text-pink-700',
		summaryPositive: 'text-green-600',
		summaryNegative: 'text-rose-500',
		summaryDivider: 'border-pink-200',
		settlementCard: 'border-pink-200 bg-white',
		settlementFrom: 'text-pink-900',
		settlementArrow: 'text-pink-300',
		settlementTo: 'text-pink-900',
		settlementAmount: 'text-pink-700 bg-pink-100',
		rowInvalid: 'bg-rose-50!',
		focusRing: 'focus:ring-pink-400',
		themeBtn: 'border-pink-300 bg-white text-pink-700 hover:bg-pink-100',
		themeBtnActive: 'border-pink-500 bg-pink-100 text-pink-800 ring-1 ring-pink-500',
		menuDropdown: 'bg-white ring-1 ring-black/5 shadow-lg',
		menuItem: 'text-pink-700 hover:bg-pink-100 hover:text-pink-900',
		menuItemActive: 'bg-pink-100 text-pink-900'
	}
];

/** Color map for FOUC prevention script in app.html — must stay in sync */
export const themeColors: Record<string, string> = Object.fromEntries(
	themes.map((t) => [t.name, t.pageColor])
);
