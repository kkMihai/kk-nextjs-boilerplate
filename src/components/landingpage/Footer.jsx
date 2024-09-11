import Link from 'next/link';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { env } from '@/env.mjs';
import config from '@/config.mjs';

function Footer() {
  const { links } = config.landingpage.footer;

  return (
    <footer className="mt-[16vh] w-full border-t">
      <div className="container mx-auto w-full px-4">
        <div className="gap-4 p-4 py-16 sm:pb-16 md:flex md:justify-between">
          <div className="mb-12 flex flex-col gap-4">
            <Link href="/" className="flex items-center justify-start gap-2">
              <Image
                src="/assets/images/logo.png"
                alt="logo"
                width={50}
                height={50}
                className="rounded-2xl invert dark:filter-none"
              />

              <span className="self-center whitespace-nowrap text-2xl font-black">
                {env.NEXT_PUBLIC_APP_NAME}
              </span>
            </Link>

            <div className="max-w-sm">
              <div className="z-10 mt-4 flex w-full flex-col items-start text-left">
                <h1 className="text-3xl font-bold lg:text-2xl">
                  Enough with the paid stuff.
                </h1>
                <p className="mt-2">
                  You {`don't`} to pay anymore for boilerplate codes, everything
                  can be free you just gotta code it.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4 sm:gap-6">
            {links.map((link, index) => (
              <div key={index}>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                  {link.category}
                </h2>
                <ul className="grid gap-2">
                  {/* eslint-disable-next-line no-shadow */}
                  {link.links.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.url}
                        className="group inline-flex cursor-pointer items-center justify-start gap-1 text-gray-400 duration-200 hover:text-gray-600 hover:opacity-90 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {item.title}
                        <Icon
                          icon="tabler:arrow-right"
                          size={16}
                          className="size-4 translate-x-0 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-2 border-t py-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
            <Link href="/" className="cursor-pointer underline">
              {env.NEXT_PUBLIC_APP_NAME}
            </Link>
            . Free and Open Source.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
