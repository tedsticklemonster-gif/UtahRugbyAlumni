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

interface PledgeReminderEmailProps {
  donorName: string;
  amount: string;
  campaignName: string;
  givingUrl: string;
}

export function PledgeReminderEmail({
  donorName = "Friend",
  amount = "$100",
  campaignName = "the season campaign",
  givingUrl = "https://utah-rugby-alumni.vercel.app/me/giving",
}: PledgeReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Friendly nudge on your Utah Rugby pledge</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={textStyle}>Hi {donorName},</Text>
            <Text style={textStyle}>
              Quick friendly nudge — you pledged {amount} to {campaignName} and
              we haven&apos;t received it yet. The team is counting on every
              dollar for travel, kit, and recruiting.
            </Text>
            <Text style={textStyle}>
              Ways to pay: check, cash, Venmo, or Zelle — or donate online:{" "}
              <Link href={givingUrl} style={linkStyle}>
                {givingUrl}
              </Link>
            </Text>
            <Text style={textStyle}>
              Already paid? Ignore this — we&apos;ll mark it once it clears.
            </Text>
            <Text style={textStyle}>Thanks for backing the program.</Text>
            <Text style={textStyle}>— Moose</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default PledgeReminderEmail;

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
