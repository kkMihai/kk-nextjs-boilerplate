import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

export function EmailChangedEmail({
  username = 'User',
  additionalData = {
    newEmail: 'Unknown@unknown.com',
    device: 'Unknown',
  },
}) {
  const previewText = `Your email has been changed`;
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
              Your email has been changed
            </Heading>
            <Text className="text-[14px] leading-[24px] text-neutral-300">
              Hello {username},
            </Text>
            <Text className="text-[14px] leading-[24px] text-neutral-300">
              Your email address has been successfully updated to{' '}
              {additionalData.newEmail} from device {additionalData.device} on{' '}
              {new Date().toDateString()}.
            </Text>
            <Text className="flex flex-col text-[14px] leading-[24px] text-neutral-300">
              <span>
                <strong>Device:</strong> {additionalData.device}
              </span>
            </Text>
            <div className="flex h-0.5 w-full rounded-xl bg-[#171717]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If it {`wasn't`} you, please contact support immediately so we can
              help you secure your account.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default EmailChangedEmail;
