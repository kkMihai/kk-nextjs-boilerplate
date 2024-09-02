import { Icon } from '@iconify/react';
import { useToast } from '@/hooks/use-toast.js';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast.jsx';

export function Toaster() {
  const { toasts } = useToast();

  const IconVariant = {
    success: 'pepicons-pop:checkmark-filled',
    error: 'octicon:x-12',
    warning: 'ic:round-warning',
    info: 'typcn:info',
    loading: 'gg:spinner',
  };

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="flex items-center gap-2">
            <Icon
              icon={IconVariant[props.variant]}
              className={`size-7 ${props?.variant?.includes('loading') ? 'animate-spin' : ''}`}
            />

            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </div>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
