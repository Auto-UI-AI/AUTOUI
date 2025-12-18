import React from 'react';
import {
  ArrowUpCircleIcon,
  CameraIcon,
  FileCodeIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  MonitorCloudIcon,
  PlugIcon,
  ChartLineIcon,
  BoxesIcon,
  GoalIcon,
  SirenIcon,
  ChartSplineIcon,
  TriangleAlertIcon,
  ZapIcon,
} from 'lucide-react';

import { NavDocuments } from './nav-documents';
import { NavMain } from './nav-main';
import { NavSecondary } from './nav-secondary';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Overview',
      url: '#',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Infrastructure',
      url: '#',
      icon: MonitorCloudIcon,
    },
    {
      title: 'Services & APIs',
      url: '#',
      icon: PlugIcon,
    },
    {
      title: 'Applications',
      url: '#',
      icon: BoxesIcon,
    },
    {
      title: 'SLOs & SLIs',
      url: '#',
      icon: GoalIcon,
    },
    {
      title: 'Insights',
      url: '#',
      icon: ChartLineIcon,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: CameraIcon,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: FileTextIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: FileCodeIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: SettingsIcon,
    },
    {
      title: 'Help & Support',
      url: '#',
      icon: HelpCircleIcon,
    },
    {
      title: 'Search',
      url: '#',
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: 'Alerts & Incidents',
      url: '#',
      icon: SirenIcon,
    },
    {
      name: 'Dashboards',
      url: '#',
      icon: ChartSplineIcon,
    },
    {
      name: 'Alert Policies',
      url: '#',
      icon: TriangleAlertIcon,
    },
    {
      name: 'Automations',
      url: '#',
      icon: ZapIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5 text-[#00E5FF]" />
                <span className="text-base font-semibold text-[#F5F7FA]">Observability Copilot</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
