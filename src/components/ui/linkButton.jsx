import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from './button.jsx';
import { cn } from '@/lib/utils.js';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.jsx';

function LinkButton({ link, expanded, openItems }) {
  const content = (
    <Button
      variant="ghost"
      className={cn(
        'min-w-10',
        expanded ? 'w-full justify-start' : 'w-fit items-center justify-center'
      )}
    >
      <Icon icon={link.icon} className={cn('size-6', expanded && 'mr-2')} />
      {expanded && link.name}
      {expanded && link.subLinks && (
        <Icon
          icon="mdi:chevron-down"
          className={cn(
            'ml-auto size-5 transition-transform duration-200',
            openItems?.includes(link.name) && 'rotate-180 transform'
          )}
        />
      )}
    </Button>
  );

  return expanded ? (
    content
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        <span>{link.name}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export { LinkButton };
