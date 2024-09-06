import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function TechIcon({ icon, name, index }) {
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
