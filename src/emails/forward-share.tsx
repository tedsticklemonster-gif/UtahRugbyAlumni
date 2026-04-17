import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ForwardShareEmailProps {
  referrerName: string;
  joinLink: string;
}

export function ForwardShareEmail({
  referrerName = "A fellow alum",
  joinLink = "https://alumni.utah-rugby.com/join",
}: ForwardShareEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{referrerName} thought you&apos;d want to know about the Utah Rugby Alumni Network</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={textStyle}>Hey,</Text>

            <Text style={textStyle}>
              {referrerName} thought you&apos;d want to know about this — a
              group of Utah Rugby alumni are building a network to stay
              connected. You can see who played when, what everyone&apos;s up to,
              and get game-day updates (if you opt in).
            </Text>

            <Text style={textStyle}>
              It takes about 2 minutes to set up your profile:{" "}
              <Link href={joinLink} style={linkStyle}>
                Join the Network
              </Link>
            </Text>

            <Text style={textStyle}>
              Go Utes!
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ForwardShareEmail;

const bodyStyle = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const containerStyle = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const textStyle = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
};

const linkStyle = {
  color: "#CC0000",
  textDecoration: "underline",
};
