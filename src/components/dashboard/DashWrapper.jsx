import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { cn } from '@/lib/utils.js';

export default function DashWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem('sidebarExpanded');

    if (storedPreference === 'true') {
      setSidebarExpanded(true);
    } else if (storedPreference === 'false') {
      setSidebarExpanded(false);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
    localStorage.setItem('sidebarExpanded', !sidebarExpanded);
  };

  const navItems = [
    { name: 'Home', icon: 'mdi:home' },
    { name: 'Settings', icon: 'mdi:cog' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          role="button"
          tabIndex={0}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'relative inset-y-0 left-0 z-50 flex w-full shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r bg-card transition-all duration-300 ease-in-out max-lg:fixed sm:w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarExpanded ? 'lg:w-64' : 'lg:w-20'
        )}
      >
        <div className="flex h-16 items-center justify-between p-4 px-3 lg:justify-center">
          <div className="flex items-center">
            <Image
              src="/assets/images/logo.png"
              alt="Dashboard Logo"
              width={1000}
              height={1000}
              quality={100}
              className="size-10"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon icon="mdi:close" className="size-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-2 py-4">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  'justify-start overflow-hidden',
                  !sidebarExpanded && 'lg:justify-center'
                )}
              >
                <Icon
                  icon={item.icon}
                  className={cn(
                    'h-5 w-5',
                    'mr-2 lg:mr-0',
                    sidebarExpanded && 'lg:mr-2'
                  )}
                />

                <span className="inline-block lg:hidden">{item.name}</span>

                {sidebarExpanded ? (
                  <span className="opacity-100 transition-opacity lg:inline-block">
                    {item.name}
                  </span>
                ) : (
                  <span className="sr-only opacity-0 transition-opacity">
                    {item.name}
                  </span>
                )}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="flex items-center justify-center p-4 max-lg:hidden">
          <Button variant="outline" size="icon" onClick={toggleSidebar}>
            <Icon
              icon="ic:round-arrow-right"
              className={`size-14 ${sidebarExpanded ? '-rotate-180' : ''} transition-transform`}
            />
            <span className="sr-only">
              {sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            </span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon icon="mdi:menu" className="size-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="flex-1" /> {/* Spacer */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-10">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="User avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon icon="mdi:cog" className="mr-2 size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon="mdi:logout" className="mr-2 size-4" />
                <span>Log out</span>
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
