import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

export function VerificationEmail({
  username = 'User',
  verificationLink = 'https://127.0.0.1/auth/verify-email?token=invalid',
  BASEURL,
}) {
  const previewText = `Verify your email address`;
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Montserrat"
          fallbackFontFamily="Arial, sans-serif"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="m-auto bg-[#0a0a0a] font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-lg border border-solid border-[#171717] bg-[#0d0d0d] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-neutral-300">
              Verify Your Email Address
            </Heading>
            <Text className="text-[14px] leading-[24px] text-neutral-300">
              Hello {username},
            </Text>
            <Text className="text-[14px] leading-[24px] text-neutral-300">
              Please click the button below to verify your email address.
            </Text>
            <Section className="my-5 text-center">
              <Button
                className="w-full rounded-md bg-[#262626] py-3 text-center text-[12px] font-semibold text-neutral-200 no-underline"
                href={verificationLink}
              >
                Verify email address
              </Button>
            </Section>
            <Text className="flex flex-col text-[14px] leading-[24px] text-neutral-300">
              <span>
                Alternatively, copy and paste this URL into your browser:
              </span>
              <Link
                href={verificationLink}
                className="text-blue-600 no-underline"
              >
                {verificationLink}
              </Link>
            </Text>
            <div className="flex h-0.5 w-full rounded-xl bg-[#171717]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you {`didn't`} request this verification, please ignore this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default VerificationEmail;
