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

interface EventReminderEmailProps {
  firstName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  eventUrl: string;
  unsubscribeUrl: string;
}

export function EventReminderEmail({
  firstName = "Friend",
  eventTitle = "Alumni Banquet",
  eventDate = "Tomorrow at 6:00 PM",
  eventLocation = null,
  eventUrl = "https://alumni.utah-rugby.com/events/example",
  unsubscribeUrl = "#",
}: EventReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reminder: {eventTitle} is tomorrow!</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={textStyle}>Hi {firstName},</Text>

            <Text style={textStyle}>
              Just a reminder — <strong>{eventTitle}</strong> is coming up tomorrow!
            </Text>

            <Text style={detailStyle}>{eventDate}</Text>
            {eventLocation && <Text style={detailStyle}>{eventLocation}</Text>}

            <Text style={textStyle}>
              <Link href={eventUrl} style={linkStyle}>
                View event details →
              </Link>
            </Text>

            <Text style={textStyle}>See you there!</Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerStyle}>
              <Link href={unsubscribeUrl} style={footerLinkStyle}>
                Unsubscribe
              </Link>{" "}
              from event reminders
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EventReminderEmail;

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
