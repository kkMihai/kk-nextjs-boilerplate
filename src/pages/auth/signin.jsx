import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Auth from '@/Auth.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.jsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { SignInSchema } from '@/schemas/auth.js';
import TwoFactorDialog from '@/components/ui/twofadialog.jsx';
import { Input } from '@/components/ui/input.jsx';

export default function SignIn({ providers }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open2FADialog, setOpen2FADialog] = useState(false);
  const [Token, setToken] = useState('');
  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // eslint-disable-next-line consistent-return
  const handleSignIn = async () => {
    setLoading(true);
    // eslint-disable-next-line no-shadow
    const loading = toast({
      description: 'Please wait...',
      variant: 'loading',
    });

    let options = {
      email: form.getValues('email'),
      password: btoa(form.getValues('password')),
      redirect: false,
    };

    if (open2FADialog && !Token) {
      setLoading(false);
      return loading.update({
        description:
          'Please enter your Two-Factor Authentication code to sign in',
        variant: 'error',
      });
    }

    if (open2FADialog && Token) options = { ...options, twoFactorToken: Token };

    // eslint-disable-next-line consistent-return
    await signIn('credentials', { ...options }).then((res) => {
      if (res?.error === 'EmailSent') {
        setLoading(false);
        return loading.update({
          title: 'Verification',
          description: 'Please check your email to verify your account',
          variant: 'success',
        });
      }
      if (res?.error?.includes('CheckEmail')) {
        setLoading(false);
        const time = res.error.split('|')[1];

        return loading.update({
          title: 'Verification',
          description: time
            ? `Check your email for an verification link. If you didn't receive the email, you can request a new one in ${time}`
            : 'Check your email for an verification link.',
          variant: 'success',
        });
      }
      if (res?.error?.includes('2FA')) {
        if (res.error.includes('Code')) {
          setLoading(false);
          return loading.update({
            description: 'The 2FA Code provided is invalid',
            variant: 'error',
          });
        }
        setLoading(false);

        loading.update({
          description: 'Enter your Two-Factor Authentication code',
          variant: 'warning',
        });

        return setOpen2FADialog(true);
      }

      if (res?.error) {
        setLoading(false);
        return loading.update({
          description: res.error,
          variant: 'error',
        });
      }

      setLoading(false);

      loading.dismiss();

      if (!res?.error) return router.push('/dashboard');
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignIn)}>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        {...field}
                        autoComplete="current-email"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Password"
                        {...field}
                        autoComplete="current-email"
                        type="password"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="flex justify-start px-0 font-normal"
                size="sm"
                variant="link"
                asChild
              >
                <Link
                  href={`/auth/reset-password${form.getValues('email') ? `?email=${form.getValues('email')}` : ''}`}
                >
                  Forgot Password?
                </Link>
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" disabled={loading} type="submit">
                Sign In
              </Button>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => router.push('/auth/signup')}
                type="button"
              >
                Sign Up
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <TwoFactorDialog
        open={open2FADialog}
        onOpenChange={setOpen2FADialog}
        tokenChange={(value) => setToken(value)}
        verifyHandler={() => {
          handleSignIn().then((r) => r);
        }}
        isLoading={loading}
      />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { session, providers } = await Auth(context);

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {
      providers,
    },
  };
}
