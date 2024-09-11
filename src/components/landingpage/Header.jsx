import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
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
import { Button } from '@/components/ui/button.jsx';
import { env } from '@/env.mjs';
import config from '@/config.mjs';

export default function Header({ session }) {
  const { links } = config.landingpage.header;

  const router = useRouter();

  const { setTheme } = useTheme();

  const MotionLink = motion(Link);
  const MotionAvatar = motion(Avatar);
  const MotionButton = motion(Button);

  return (
    <div className="container relative inset-x-0 top-0 z-50 mx-auto mt-5 flex h-16 items-center justify-between rounded-2xl px-4">
      <div className="flex items-center gap-x-4">
        <motion.span
          className="text-2xl font-black"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Image
            src="/assets/images/logo.png"
            alt="logo"
            width={50}
            height={50}
            className="rounded-2xl invert dark:filter-none"
          />
        </motion.span>
        <motion.h1
          className="text-2xl font-extrabold max-md:hidden"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {env.NEXT_PUBLIC_APP_NAME}
        </motion.h1>
        <nav className="ml-10 flex gap-x-4 max-md:hidden">
          {links.map((link, index) => (
            <MotionLink
              href={link.url}
              key={index}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
            >
              <Button variant="ghost" className="tracking-wider">
                {link.title}
              </Button>
            </MotionLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-x-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MotionAvatar
                className=""
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <AvatarImage
                  src={session.user.avatar}
                  alt={session.user.username}
                />
                <AvatarFallback>
                  {session?.user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </MotionAvatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-44">
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
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <Icon icon="tabler:dashboard" className="mr-2 size-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
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
        ) : (
          <div className="flex gap-x-4">
            <MotionButton
              variant="outline"
              onClick={() => router.push('/auth/signin')}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <Icon icon="tabler:login" className="size-4 md:hidden" />
              <span className="hidden md:block">Sign In</span>
            </MotionButton>
            <MotionButton
              onClick={() => router.push('/auth/signup')}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <Icon icon="tabler:plus" className="size-4 md:hidden" />
              <span className="hidden md:block">Sign Up</span>
            </MotionButton>
          </div>
        )}
      </div>
    </div>
  );
}
