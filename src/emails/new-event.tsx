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

interface NewEventEmailProps {
  firstName: string;
  eventTitle: string;
  eventKind: string;
  eventDate: string;
  eventLocation: string | null;
  eventUrl: string;
  unsubscribeUrl: string;
}

const KIND_LABELS: Record<string, string> = {
  social: "Social",
  reunion: "Reunion",
  watch_party: "Watch Party",
  practice: "Practice",
  other: "Event",
};

export function NewEventEmail({
  firstName = "Friend",
  eventTitle = "Alumni Banquet",
  eventKind = "social",
  eventDate = "Saturday, May 10, 2025 at 6:00 PM",
  eventLocation = null,
  eventUrl = "https://utah-rugby-alumni.vercel.app/events/example",
  unsubscribeUrl = "#",
}: NewEventEmailProps) {
  const kindLabel = KIND_LABELS[eventKind] ?? "Event";

  return (
    <Html>
      <Head />
      <Preview>New {kindLabel}: {eventTitle}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={badgeStyle}>{kindLabel.toUpperCase()}</Text>

            <Text style={textStyle}>Hi {firstName},</Text>

            <Text style={textStyle}>
              A new event was just posted on Utah Rugby Alumni:
            </Text>

            <Text style={titleStyle}>{eventTitle}</Text>

            <Text style={detailStyle}>{eventDate}</Text>
            {eventLocation && <Text style={detailStyle}>{eventLocation}</Text>}

            <Text style={textStyle}>
              <Link href={eventUrl} style={linkStyle}>
                View event &amp; RSVP →
              </Link>
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerStyle}>
              <Link href={unsubscribeUrl} style={footerLinkStyle}>
                Unsubscribe
              </Link>{" "}
              from new event notifications
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NewEventEmail;

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

const badgeStyle = {
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "1.5px",
  color: "#CC0000",
  marginBottom: "4px",
};

const textStyle = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: "800" as const,
  lineHeight: "30px",
  color: "#111111",
  margin: "8px 0",
};

const detailStyle = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
  margin: "2px 0",
};

const linkStyle = {
  color: "#CC0000",
  textDecoration: "underline",
  fontWeight: "600" as const,
};

const footerSection = {
  marginTop: "32px",
  borderTop: "1px solid #e5e5e5",
  paddingTop: "16px",
};

const footerStyle = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#999999",
  textAlign: "center" as const,
};

const footerLinkStyle = {
  color: "#999999",
  textDecoration: "underline",
};
