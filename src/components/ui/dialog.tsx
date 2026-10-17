'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
type ContentProps = {
  title: string;
  description: string;
  children: ReactNode;
  variant?: 'modal' | 'sheet' | 'command' | 'navigation';
} & Pick<ComponentProps<typeof DialogPrimitive.Content>, 'onOpenAutoFocus' | 'onCloseAutoFocus'>;

export function DialogContent({ title, description, children, variant = 'modal', ...focusProps }: ContentProps) {
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="dialog-overlay" />
    <DialogPrimitive.Content className={`dialog-content dialog-${variant}`} {...focusProps}>
      {variant === 'sheet' && <div className="sheet-eyebrow">A CLOSER LOOK</div>}
      <div className={variant === 'command' || variant === 'navigation' ? 'sr-only' : 'dialog-header'}>
        <DialogPrimitive.Title className="dialog-title">{title}</DialogPrimitive.Title>
        <DialogPrimitive.Description className="muted dialog-description">{description}</DialogPrimitive.Description>
      </div>
      {children}
      <DialogPrimitive.Close className="dialog-close" aria-label={variant === 'navigation' ? 'Close navigation' : 'Close dialog'}><X size={20} /></DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
}
