import {
    Body,
    Button,
    Container,
    Font,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from "@react-email/components";
import * as React from "react";

export const PasswordResetEmail = ({
                                       username = "User",
                                       passwordResetUrl = "https://delvfox.co/auth/new-password?token=invalid", BASEURL
                                   }) => {
    const previewText = `Verify your email address for Delvfox`;
    return (
        <Html lang="en">
            <Head>
                <Font
                    fontFamily="Montserrat"
                    fallbackFontFamily="Arial, sans-serif"
                    webFont={{
                        url: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-[#0a0a0a] mx-auto my-auto font-sans">
                    <Container
                        className="bg-[#0d0d0d] border border-solid border-[#171717] rounded-lg my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src={`${BASEURL}/assets/images/logo.svg`}
                                width="100"
                                height="100"
                                alt="Delvfox"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-neutral-300 text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                           Change your password
                        </Heading>
                        <Text className="text-neutral-300 text-[14px] leading-[24px]">
                            Hello {username},
                        </Text>
                        <Text className="text-neutral-300 text-[14px] leading-[24px]">
                            Someone recently requested a password change for your Delvfox account. If this was you, you can reset your password by clicking the button below.
                        </Text>
                        <Section className="text-center my-5">
                            <Button
                                className="bg-[#262626] rounded-md text-neutral-200 text-[12px] font-semibold no-underline text-center py-3 w-full"
                                href={passwordResetUrl}
                            >
                                Reset Password
                            </Button>
                        </Section>
                        <Text className="text-neutral-300 text-[14px] leading-[24px]">
                            or copy and paste this URL into your web browser:{" "}
                            <Link
                                href={passwordResetUrl}
                                className="text-blue-600 no-underline"
                            >
                                {passwordResetUrl}
                            </Link>
                        </Text>
                        <div className="flex w-full h-0.5 bg-[#171717] rounded-xl"/>
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If you did not request a password reset, please ignore this email or contact us to let us know in case you have any security concerns.
                        </Text>

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            Regards, Delvfox
                        </Text>
                    </Container>

                    <Container className="text-center">
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            © {new Date().getFullYear()} Delvfox. All rights reserved.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PasswordResetEmail;
