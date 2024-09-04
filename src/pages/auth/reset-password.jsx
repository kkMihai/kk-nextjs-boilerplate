import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile } from '@marsidev/react-turnstile';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { ForgotPasswordSchema } from '@/schemas/auth.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp.jsx';

export default function ResetPassword({ params }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [open2FADialog, setOpen2FADialog] = useState(false);
  const [Token, setToken] = useState('');
  const form = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleResetPassword = async () => {
    setLoading(true);

    const loadingToast = toast({
      title: '',
      description: 'Please wait...',
      variant: 'loading',
    });

    let body = {
      email: form.getValues('email'),
      captchaToken,
    };

    if (Token && open2FADialog) {
      body = {
        ...body,
        OTPCode: Token,
      };
    }

    const response = await fetch(`/api/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.message === '2FA required' && !Token && !open2FADialog) {
      setLoading(false);
      setOpen2FADialog(true);
      loadingToast.update({
        title: '',
        description: 'Enter your Two-Factor Authentication code',
        variant: 'warning',
      });

      return;
    }

    loadingToast.update({
      title: '',
      description: data.message,
      variant: data.type,
    });

    if (data.type === 'success') {
      setOpen2FADialog(false);
      setToken('');
      setLoading(false);
    }

    captchaRef.current?.reset();

    setLoading(false);
  };

  useEffect(() => {
    if (params?.email) {
      form.setValue('email', params?.email);
    }
  }, [form, params?.email]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Forgot Your Password?</CardTitle>
          <CardDescription>
            Enter your email address and {`we'll`} send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(handleResetPassword)}>
          <CardContent>
            <Turnstile
              ref={captchaRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onExpire={() => ref.current?.reset()}
              onSuccess={setCaptchaToken}
              className="mx-auto mb-4"
            />

            <Input
              type="email"
              placeholder="Email"
              className="mb-4"
              autoComplete="email"
              {...form.register('email')}
              disabled={loading}
            />
          </CardContent>
          <CardFooter className="flex flex-col pb-1">
            <Button className="w-full" disabled={loading} type="submit">
              Send Reset Email
            </Button>
            <Button variant="link" className="my-2" type="button">
              <Link href="/auth/signin">Back to sign in</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={open2FADialog} onOpenChange={setOpen2FADialog}>
        <DialogContent>
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
                value={Token}
                onChange={(value) => setToken(value)}
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
              onClick={handleResetPassword}
              className="mt-5 w-full"
              disabled={loading}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export async function getServerSideProps(context) {
  const params = context.query;
  return {
    props: {
      params,
    },
  };
}
