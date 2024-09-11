import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

export function PasswordChangedEmail({
  username = 'User',
  additionalData = {
    device: 'Unknown',
  },
  BASEURL,
}) {
  const previewText = `Your password has been changed`;
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
            <Section className="mt-[32px]">
              <Img
                src={`${BASEURL}/assets/images/logo.svg`}
                width="100"
                height="100"
                alt="Delvfox"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-neutral-300">
              Your password has been changed
            </Heading>
            <Text className="text-[14px] leading-[24px] text-neutral-300">
              Hello {username},
            </Text>
            <Text className="text-[14px] leading-[24px] text-neutral-300">
              You updated the password for your Delvfox account on{' '}
              {new Date().toDateString()} If this was you, then no further
              action is required.
            </Text>
            <Text className="flex flex-col text-[14px] leading-[24px] text-neutral-300">
              <span>
                <strong>Device:</strong> {additionalData.device}
              </span>
            </Text>
            <div className="flex h-0.5 w-full rounded-xl bg-[#171717]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you did not make this change, please take immediate action by
              contacting support or resetting your password immediately.
            </Text>

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              Regards, Delvfox
            </Text>
          </Container>

          <Container className="text-center">
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              © {new Date().getFullYear()} Delvfox. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PasswordChangedEmail;
