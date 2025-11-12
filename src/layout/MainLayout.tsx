import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Menu, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Building2, Files, PackageSearch, Settings2, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';

type SidebarItem = {
	label: string;
	icon: LucideIcon;
	value: string;
};

type ModuleTab = {
	label: string;
	value: string;
};

type MainLayoutProps = {
	moduleName: string;
	tabs: ModuleTab[];
	activeTab: string;
	onTabChange: (next: string) => void;
	companyName?: string;
	actions?: ReactNode;
	children: ReactNode;
	sidebarItems?: SidebarItem[];
	activeSidebar?: string;
};

const defaultSidebar: SidebarItem[] = [
	{ label: 'Terceros', icon: UsersRound, value: 'third-parties' },
	{ label: 'Inventarios', icon: PackageSearch, value: 'inventory' },
	{ label: 'Documentos', icon: Files, value: 'documents' },
	{ label: 'Reportes', icon: Building2, value: 'reports' },
	{ label: 'Configuración', icon: Settings2, value: 'settings' },
];

const MainLayout = ({
	moduleName,
	tabs,
	activeTab,
	onTabChange,
	companyName = 'Empresa Autorizada: EL MAYORISTA SAS',
	actions,
	children,
	sidebarItems = defaultSidebar,
	activeSidebar = 'inventory',
}: MainLayoutProps) => {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer

	return (
		<div className="app-shell flex bg-background text-secondary h-screen">
			{/* Sidebar Desktop */}
			<aside
				className={`hidden md:flex flex-col gap-8 border-r border-border bg-surface px-2 py-8 transition-all duration-300 ${
					sidebarCollapsed ? 'w-20' : 'w-64 xl:w-72'
				}`}
			>
				{/* Logo y Collapse */}
				<div className="relative flex flex-col items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/15 text-2xl font-bold text-primary">
						EM
					</div>
					{!sidebarCollapsed && (
						<span className="text-center font-display text-base font-semibold text-secondary">
							El Mayorista
						</span>
					)}

					{/* Collapse toggle */}
					<button
						type="button"
						onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
						className="absolute top-14 -right-4 z-40 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface/40 text-secondary shadow-md hover:bg-primary/40 transition"
					>
						{sidebarCollapsed ? (
							<ChevronsRight className="h-5 w-5" />
						) : (
							<ChevronsLeft className="h-5 w-5" />
						)}
					</button>
				</div>

				{/* Sidebar Items */}
				<nav className="flex flex-1 flex-col gap-4">
					{sidebarItems.map(({ label, icon: Icon, value }) => {
						const isActive = value === activeSidebar;
						return (
							<button
								key={value}
								type="button"
								className={`group flex items-center gap-3 rounded-3xl border px-2 py-3 text-sm font-semibold transition ${
									isActive
										? 'border-primary/60 bg-primary text-white shadow-soft'
										: 'border-transparent text-secondary hover:border-primary/40 hover:bg-primary/5'
								}`}
							>
								<span
									className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
										isActive ? 'bg-white/10 text-white' : 'bg-primary/12 text-primary'
									}`}
								>
									<Icon className="h-5 w-5" />
								</span>
								{!sidebarCollapsed && <span className={isActive ? 'text-white' : 'text-secondary'}>{label}</span>}
							</button>
						);
					})}
				</nav>
			</aside>

			{/* Sidebar Mobile Drawer */}
			<div
				className={`fixed inset-0 z-40 flex md:hidden transition-transform ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className="flex w-64 flex-col gap-8 border-r border-border bg-surface px-4 py-8">
					<div className="flex justify-between items-center mb-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/15 text-2xl font-bold text-primary">
							EM
						</div>
						<button
							type="button"
							onClick={() => setSidebarOpen(false)}
							className="p-2 text-secondary hover:bg-primary/10 rounded-md"
						>
							✕
						</button>
					</div>
					<nav className="flex flex-1 flex-col gap-4">
						{sidebarItems.map(({ label, icon: Icon, value }) => {
							const isActive = value === activeSidebar;
							return (
								<button
									key={value}
									type="button"
									onClick={() => setSidebarOpen(false)}
									className={`group flex items-center gap-3 rounded-3xl border px-4 py-5 text-sm font-semibold transition ${
										isActive
											? 'border-primary/60 bg-primary text-white shadow-soft'
											: 'border-transparent text-secondary hover:border-primary/40 hover:bg-primary/5'
									}`}
								>
									<span
										className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
											isActive ? 'bg-white/10 text-white' : 'bg-primary/12 text-primary'
										}`}
									>
										<Icon className="h-5 w-5" />
									</span>
									<span className={isActive ? 'text-white' : 'text-secondary'}>{label}</span>
								</button>
							);
						})}
					</nav>
				</div>
				<div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
			</div>

			{/* Main Content */}
			<main className="flex-1 h-full overflow-y-auto bg-background">
				<header className="border-b border-border bg-surface/80 backdrop-blur">
					<div className="mx-auto flex w-full max-w-full flex-col gap-2 px-6 py-5">
						<div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted">
							<span>{companyName}</span>
							<div className="flex items-center gap-2">
								{actions}
								<button
									className="md:hidden"
									onClick={() => setSidebarOpen(true)}
									aria-label="Menu"
								>
									<Menu className="h-6 w-6 text-primary" />
								</button>
							</div>
						</div>
						<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<h1 className="text-xl font-semibold text-secondary">
								Módulo: <span className="font-bold text-primary uppercase">{moduleName}</span>
							</h1>
						</div>
						<div className="flex flex-nowrap gap-3 overflow-x-auto pt-2">
							{tabs.map((tab) => {
								const isActive = tab.value === activeTab;
								return (
									<button
										key={tab.value}
										type="button"
										onClick={() => onTabChange(tab.value)}
										className={`whitespace-nowrap rounded-full px-6 py-3 text-base font-semibold transition ${
											isActive
												? 'bg-primary text-white shadow-lg shadow-primary/30'
												: 'bg-warning/30 text-secondary hover:bg-warning/50'
										}`}
									>
										{tab.label}
									</button>
								);
							})}
						</div>
					</div>
				</header>

				<div className="h-full w-full px-6 py-8">
					<div className="h-full space-y-8 pb-12">{children}</div>
				</div>
			</main>
		</div>
	);
};

export default MainLayout;
