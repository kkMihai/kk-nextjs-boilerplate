import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useRouter } from "next/navigation";

export default function VerifyEmail({ token }) {
  const router = useRouter();
  const captchaRef = useRef(null);
  const [fetchVerifyEmail, setFetchVerifyEmail] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["verify-email", { token }],
    queryFn: async function () {
      return fetch(`/api/auth/verify-email`, {
        method: "POST",
        body: JSON.stringify({ token, captchaToken }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    },
    enabled: fetchVerifyEmail,
  });

  const handleVerifyEmail = async () => {
    if (data?.message === "Token not found") return;
    if (data?.type === "success") return router.push("/auth/signin");

    if (!captchaToken) return;

    setFetchVerifyEmail(true);
    await refetch();
    setFetchVerifyEmail(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-96">
        <CardHeader className={"text-center"}>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Please verify your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent className={"flex items-center justify-center"}>
          {!isLoading && !isError && !data && token && (
            <Turnstile
              ref={captchaRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onExpire={() => ref.current?.reset()}
              onSuccess={setCaptchaToken}
            />
          )}

          {isLoading && (
            <Icon icon={"gg:spinner"} className={"w-7 h-7 animate-spin"} />
          )}
          {data && (
            <Alert variant={data.type}>
              <AlertTitle className={"capitalize"}>{data.type}</AlertTitle>
              <AlertDescription>{data.message}</AlertDescription>
            </Alert>
          )}

          {!token && (
            <Alert variant={"error"}>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>No token provided</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant={"secondary"}
            className={"w-full mt-4"}
            disabled={
              !token
                ? true
                : isLoading || isError || data?.message === "Token not found"
            }
            onClick={handleVerifyEmail}
          >
            {!data
              ? "Verify Email"
              : data?.type === "success"
                ? "Go to Sign In"
                : "Retry"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { token } = context.query;
  return {
    props: {
      token: token || null,
    },
  };
}
