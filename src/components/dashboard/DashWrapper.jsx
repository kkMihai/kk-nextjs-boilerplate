import { useCallback, useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.jsx';
import { cn } from '@/lib/utils.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.jsx';
import { LinkButton } from '@/components/ui/linkButton.jsx';
import config from '@/config.mjs';

const navItems = config.dashboard.sidebar.links;

const useSidebarState = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    const storedPreference = localStorage.getItem('sidebarExpanded');
    if (storedPreference !== null) {
      setSidebarExpanded(JSON.parse(storedPreference));
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    localStorage.setItem('sidebarExpanded', JSON.stringify(newState));
  }, [sidebarExpanded]);

  const toggleItem = useCallback((itemName) => {
    setOpenItems((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }));
  }, []);

  const toggleSidebarMobile = useCallback((open) => {
    setSidebarOpen(open);
    setSidebarExpanded(open);
  }, []);

  return {
    sidebarExpanded,
    sidebarOpen,
    openItems,
    toggleSidebar,
    toggleItem,
    toggleSidebarMobile,
  };
};

// Component for rendering a single navigation link
function NavLink({ link, sidebarExpanded, openItems, toggleItem }) {
  if (link.subLinks && sidebarExpanded) {
    return (
      <Collapsible
        open={openItems[link.name]}
        onOpenChange={() => toggleItem(link.name)}
      >
        <CollapsibleTrigger asChild>
          <div className="items-center">
            <LinkButton link={link} expanded={sidebarExpanded} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-6 mt-1 space-y-1">
            {link.subLinks.map((subLink) => (
              <Button
                key={subLink.name}
                variant="ghost"
                asChild
                className="w-full justify-start gap-3 pl-6"
              >
                <Link href={subLink.href}>
                  <Icon icon={subLink.icon} className="size-4" />
                  {subLink.name}
                </Link>
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  if (link.subLinks && !sidebarExpanded) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <LinkButton link={link} expanded={sidebarExpanded} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" sideOffset={10}>
          <DropdownMenuLabel>{link.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {link.subLinks.map((subLink) => (
              <DropdownMenuItem
                key={subLink.name}
                className="flex flex-row items-center"
                asChild
              >
                <Link href={subLink.href}>
                  <Icon icon={subLink.icon} className="mr-2 size-4" />
                  <span>{subLink.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          asChild
          className={`justify-start ${sidebarExpanded ? 'w-full' : 'w-fit'}`}
        >
          <Link href={link.href}>
            <Icon icon={link.icon} className="size-6" />
            <span className={`ml-2 ${sidebarExpanded ? '' : 'sr-only'}`}>
              {link.name}
            </span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        <span>{link.name}</span>
      </TooltipContent>
    </Tooltip>
  );
}

// Component for rendering the sidebar content
function SidebarContent({ sidebarExpanded, openItems, toggleItem }) {
  return (
    <>
      <div className="flex items-center justify-center overflow-x-hidden border-b p-3">
        <Link href="/" className="flex items-center justify-start gap-2">
          <Image
            src="/assets/images/logo.png"
            alt="logo"
            width={500}
            height={50}
            className="size-10 rounded-xl invert dark:filter-none"
          />
          {sidebarExpanded && (
            <span className="self-center whitespace-nowrap text-2xl font-black">
              Brand
            </span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-2">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <div key={item.category}>
                <div
                  className={cn(
                    'mt-3 flex items-center px-2 py-1 text-sm font-medium text-muted-foreground',
                    !sidebarExpanded && 'justify-center'
                  )}
                >
                  {sidebarExpanded ? (
                    <span>{item.category}</span>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Icon icon="tabler:dots" className="size-5" />
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={20}>
                        <span>{item.category}</span>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {item.links.map((link) => (
                  <div
                    key={link.name}
                    className={cn(
                      !sidebarExpanded && 'flex items-center justify-center'
                    )}
                  >
                    <NavLink
                      link={link}
                      sidebarExpanded={sidebarExpanded}
                      openItems={openItems}
                      toggleItem={toggleItem}
                    />
                  </div>
                ))}
              </div>
            ))}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      <div className="flex items-center justify-center p-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="mt-auto gap-2 text-red-500"
                size={!sidebarExpanded ? 'icon' : ''}
                onClick={() => signOut()}
              >
                <Icon icon="tabler:logout" className="size-6" />
                <span
                  className={cn('inline-block', !sidebarExpanded && 'sr-only')}
                >
                  Sign Out
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <span>Sign Out</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}

// Main DashWrapper component
export default function DashWrapper({ session, children }) {
  const router = useRouter();
  const {
    sidebarExpanded,
    sidebarOpen,
    openItems,
    toggleSidebar,
    toggleItem,
    toggleSidebarMobile,
  } = useSidebarState();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'relative hidden flex-col border-r bg-card transition-all duration-300 ease-in-out lg:flex',
          sidebarExpanded ? 'w-64' : 'w-24'
        )}
      >
        <div className="absolute -right-4 top-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className={cn('h-8 w-8', !sidebarExpanded && 'mx-auto')}
          >
            <Icon
              icon="tabler:chevron-left"
              className={`size-5 ${
                !sidebarExpanded ? 'rotate-180' : ''
              } transition-transform duration-300`}
            />

            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <SidebarContent
          sidebarExpanded={sidebarExpanded}
          openItems={openItems}
          toggleItem={toggleItem}
        />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${
          sidebarOpen
            ? '-translate-x-0'
            : 'pointer-events-none -translate-x-full'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-500`}
          onClick={() => toggleSidebarMobile(false)}
          onKeyDown={() => toggleSidebarMobile(false)}
          role="button"
          tabIndex={0}
        />
        <aside className="absolute left-0 top-0 h-full w-64 bg-card">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => toggleSidebarMobile(false)}
          >
            <Icon icon="mdi:close" className="size-6" />
          </Button>
          <SidebarContent
            sidebarExpanded={sidebarExpanded}
            openItems={openItems}
            toggleItem={toggleItem}
          />
        </aside>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => toggleSidebarMobile(true)}
          >
            <Icon icon="mdi:menu" className="size-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="flex-1" />
          {/* User dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src={session.user.avatar}
                  alt={session.user.username}
                />
                <AvatarFallback>
                  {session?.user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-3 w-48">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-bold">{session.user.username}</span>
                <span className="text-muted-foreground">
                  {`${session.user.email.split('@')[0].replace(/./g, '*')}@${
                    session.user.email.split('@')[1]
                  }`}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <Icon icon="tabler:settings" className="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-500"
              >
                <Icon icon="tabler:logout" className="mr-2 size-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Dashboard content */}
        <div className="h-[calc(100vh-4rem)] w-full overflow-auto p-4 lg:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
