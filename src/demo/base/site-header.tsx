import { Separator } from './separator';
import { SidebarTrigger } from './sidebar';

export function SiteHeader() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b border-[#2A2F37] bg-[#1A1D23] transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-[#A9B2C1] hover:text-[#00E5FF]" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 bg-[#2A2F37]" />
        <h1 className="text-base font-medium text-[#F5F7FA]">Observability Dashboard</h1>
      </div>
    </header>
  );
}
