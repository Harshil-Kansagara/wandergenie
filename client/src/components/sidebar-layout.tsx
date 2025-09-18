import React from "react";
import { Link, useLocation } from "wouter";
import MainHeader from "@/components/main-header";
import {
  Home,
  PlusCircle,
  Briefcase,
  User,
  Compass,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface NavItemProps {
  readonly href: string;
  readonly icon: React.ElementType;
  readonly label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label }) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <SidebarMenuItem>
      <Link href={href}>
        <SidebarMenuButton isActive={isActive} tooltip={label}>
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};

const SidebarToggle = () => {
  const { open, toggleSidebar } = useSidebar();
  return (
    <div className="flex items-center">
      <SidebarTrigger className={cn(open && "group-data-[variant=sidebar]:hidden")} />
      <SidebarTrigger onClick={() => toggleSidebar()} className={cn(open && "group-data-[variant=sidebar]:hidden")} />
    </div>
  );
};

export default function SidebarLayout({ children }: { readonly children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <SidebarToggle />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="size-5" />
            </div>
            <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">WanderGenie</span>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <NavItem href="/dashboard" icon={Home} label="Dashboard" />
            <NavItem href="/planner" icon={PlusCircle} label="Plan a New Trip" />
            <NavItem href="/trips" icon={Briefcase} label="My Trips" />
            <NavItem href="/profile" icon={User} label="Profile" />
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm font-medium text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                <Avatar className="size-7">
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                  <p className="truncate font-medium">{user?.displayName ?? "Guest User"}</p>
                  <p className="truncate text-xs text-sidebar-foreground/70">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile"><Settings className="mr-2" /><span>Settings</span></Link></DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}><LogOut className="mr-2" /><span>Log out</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <MainHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}