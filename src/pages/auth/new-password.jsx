import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/passwordResetToken";

export default function NewPassword({ token, isTokenExpired, tokenExists }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const form = useForm({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleNewPassword = async () => {
    setLoading(true);

    const loadingToast = toast({
      title: "",
      description: "Please wait...",
      variant: "loading",
    });

    if (isTokenExpired) {
      loadingToast.update({
        title: "",
        description:
          "The token has expired. Please request a new password reset link",
        variant: "error",
      });

      setLoading(false);
      return;
    }

    const response = await fetch(`/api/auth/new-password`, {
      method: "POST",
      body: JSON.stringify({
        token,
        password: btoa(form.getValues("password")),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    loadingToast.dismiss();

    if (data.type === "success") {
      setIsPasswordReset(true);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Please enter your new password to reset your account password
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNewPassword)}>
            <CardContent>
              {!tokenExists && (
                <Alert variant={"error"}>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Token not found</AlertDescription>
                </Alert>
              )}
              {tokenExists && isTokenExpired ? (
                <Alert variant={"error"}>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    The token has expired. Please request a new password reset
                    link
                  </AlertDescription>
                </Alert>
              ) : !tokenExists ? null : isPasswordReset ? (
                <Alert variant={"success"}>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your password has been updated successfully. You can now
                    sign in with your new password
                  </AlertDescription>
                </Alert>
              ) : (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="New Password"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
            <CardFooter className={"flex flex-col pb-1"}>
              <Button
                className="w-full mt-3"
                disabled={
                  loading || !tokenExists || isTokenExpired || isPasswordReset
                }
                type="submit"
              >
                Reset Password
              </Button>
              <Button variant={"link"} className="my-2" type={"button"}>
                <Link href={"/auth/signin"}>Back to sign in</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { token } = context.query;

  const existingToken = await getPasswordResetTokenByToken(token);

  const isTokenExpired = token
    ? new Date(existingToken?.expires) < new Date()
    : null;

  return {
    props: {
      token: token || null,
      tokenExists: !!existingToken,
      isTokenExpired: isTokenExpired,
      lol: "if you see this then dont worry we do backend checks too :) ",
      MeInTheFuture: "why tf i writed this idk", // <--- supposed to be funny ig
    },
  };
}
