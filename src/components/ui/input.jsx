import * as React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.jsx';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  let inputType;

  switch (type) {
    case 'password':
      inputType = showPassword ? 'text' : 'password';
      break;
    case 'copy':
      inputType = 'text';
      break;
    default:
      inputType = type;
      break;
  }

  function handleCopy() {
    navigator.clipboard.writeText(props.value).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    });
  }

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        className={cn(
          'h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
      {(type === 'password' || type === 'copy') && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={type === 'password' ? toggleShowPassword : handleCopy}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {type === 'password' && (
                  <Icon
                    icon={showPassword ? 'ion:eye-off' : 'ion:eye'}
                    className="size-6"
                  />
                )}
                {type === 'copy' && (
                  <Icon
                    icon={isCopied ? 'tabler:copy-check-filled' : 'ion:copy'}
                    className={`size-6 antialiased transition-transform duration-300 group-hover:scale-110${
                      isCopied ? 'text-green-500' : 'text-muted-foreground'
                    }`}
                  />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {/* eslint-disable-next-line no-nested-ternary */}
              {type === 'password'
                ? showPassword
                  ? 'Hide password'
                  : 'Show password'
                : isCopied
                  ? 'Copied!'
                  : 'Copy'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
