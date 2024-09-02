import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button.jsx';

function TechIcon({ icon, name, index }) {
  return (
    <motion.div
      className="flex select-none flex-col items-center rounded-lg border bg-card p-4 shadow-md transition-shadow duration-300 hover:shadow-lg dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-neutral-800"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ rotate: index % 2 === 0 ? -3 : 3 }}
    >
      <Icon icon={icon} className="mb-3 size-16 text-primary" />
      <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300">
        {name}
      </span>
    </motion.div>
  );
}

const techStack = [
  { icon: 'ri:nextjs-fill', name: 'Next.js' },
  { icon: 'simple-icons:prisma', name: 'Prisma' },
  { icon: 'simple-icons:shadcnui', name: 'ShadCN UI' },
  { icon: 'arcticons:ente-authenticator', name: 'NextAuth' },
  { icon: 'mdi:tailwind', name: 'Tailwind CSS' },
  { icon: 'cib:minutemailer', name: 'Nodemailer' },
];

export default function Hero() {
  const router = useRouter();
  return (
    <>
      <div className="absolute top-0 z-[-1] h-screen w-full bg-grid-black/[0.08] dark:bg-grid-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <section className="container relative z-40 mt-16 flex h-[60vh] w-full flex-col max-md:px-4 md:mt-48 md:justify-start">
        <div className="flex flex-row items-center justify-between gap-5 md:items-start md:text-left">
          <div className="flex flex-col justify-center gap-3">
            <h1 className="max-w-2xl bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-6xl font-black text-transparent dark:from-white dark:to-neutral-400">
              Build your{' '}
              <span className="bg-green-400 px-2.5 text-background">
                website
              </span>{' '}
              this month.
            </h1>
            <p className="max-w-lg text-xl dark:text-neutral-300">
              Enough with the paid solutions. You don’t need to spend money on a
              boilerplate just to build your website in a week and fail. Great
              things take great time.
            </p>
            <Button
              className="mt-4 gap-2 md:w-fit"
              size="lg"
              onClick={() =>
                router.push(
                  'https://github.com/new?template_name=kk-nextjs-boilerplate&template_owner=kkMihai'
                )
              }
            >
              <Icon icon="oi:bolt" className="size-5" />
              Start Shipping
            </Button>
            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
              this website is using this exact boilerplate
            </p>
          </div>
          <motion.div
            className="relative mx-auto max-w-2xl max-lg:hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-3 gap-6">
              {techStack.map((tech, index) => (
                <TechIcon
                  key={index}
                  icon={tech.icon}
                  name={tech.name}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
