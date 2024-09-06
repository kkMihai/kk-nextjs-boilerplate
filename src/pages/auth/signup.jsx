import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { signIn } from 'next-auth/react';
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
import { Input } from '@/components/ui/input.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { ToastAction } from '@/components/ui/toast.jsx';
import { SignUpSchema } from '@/schemas/auth.js';
import { env } from '@/env.mjs';

export default function SignUp({ providers }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      captchaToken: '',
    },
  });

  const handleSignUp = async () => {
    setLoading(true);

    const loadingToast = toast({
      title: '',
      description: 'Please wait...',
      variant: 'loading',
    });

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: form.getValues('username'),
        email: form.getValues('email'),
        password: btoa(form.getValues('password')),
        captchaToken: form.getValues('captchaToken'),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      loadingToast.update({
        title: '',
        description: data.message,
        variant: data.type,
      });

      setLoading(false);
      return;
    }

    loadingToast.update({
      title: '',
      description: data.message,
      variant: data.type,
      action:
        data.type === 'success' ? (
          <ToastAction
            altText="Sign In"
            onClick={() => router.push('/auth/signin')}
          >
            Sign In
          </ToastAction>
        ) : null,
    });

    setLoading(false);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Sign up to start using {env.NEXT_PUBLIC_APP_NAME}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-0">
          {providers && Object.values(providers).length > 0 && (
            <div className="space-y-2">
              <div className="flex space-x-2">
                {Object.values(providers).map((provider) => (
                  <Button
                    key={provider.name}
                    onClick={() =>
                      signIn(provider.id, {
                        callbackUrl: '/dashboard',
                      })
                    }
                    variant="secondary"
                    className="w-full"
                  >
                    Sign Up with {provider.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        {Object.values(providers).length > 0 && (
          <CardContent className="flex items-center justify-center py-3">
            <div className="w-full border-t border-secondary" />
            <div className="px-3 text-sm text-muted-foreground">OR</div>
            <div className="w-full border-t border-secondary" />
          </CardContent>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignUp)}>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        {...field}
                        autoComplete="username-email"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <FormField
                control={form.control}
                name="captchaToken"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <Turnstile
                        ref={captchaRef}
                        siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                        onExpire={() => captchaRef.current?.reset()}
                        onSuccess={(token) =>
                          form.setValue('captchaToken', token)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500">
                  By signing up, you agree to our{' '}
                  <Link
                    href="/policies/terms"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/policies/privacy"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={loading}>
                Sign Up
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/')}
                type="button"
              >
                Go back to Home
              </Button>

              <div className="mt-4 flex items-center justify-center">
                <span className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link
                    href="/auth/signin"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Sign in
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
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
