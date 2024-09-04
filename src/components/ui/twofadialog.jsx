'use client';

import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp.jsx';

function Twofadialog({
  open,
  onOpenChange,
  verifyHandler,
  tokenChange,
  isLoading,
}) {
  const [token, setToken] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication Verification</DialogTitle>
          <DialogDescription>
            Open your Authenticator App and enter the code below to verify
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-start justify-center">
          <div className="mx-auto mt-5 flex flex-col items-center justify-center gap-3">
            <p className="text-xs text-neutral-500">
              Enter the 6-digit code from your Authenticator App
            </p>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={token}
              onChange={(value) => {
                setToken(value);
                tokenChange(value);
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            onClick={() => verifyHandler(token)}
            className="mt-5 w-full"
            disabled={token.length !== 6 || isLoading}
          >
            Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Twofadialog;
