import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface DigestAlumni {
  firstName: string;
  lastName: string;
  gradYear: number | null;
}

export interface DigestEvent {
  title: string;
  date: string;
  location: string | null;
  url: string;
}

interface WeeklyDigestEmailProps {
  firstName: string;
  newAlumni: DigestAlumni[];
  upcomingEvents: DigestEvent[];
  postsCount: number;
  appUrl: string;
  unsubscribeUrl?: string;
}

export function WeeklyDigestEmail({
  firstName = "Friend",
  newAlumni = [],
  upcomingEvents = [],
  postsCount = 0,
  appUrl = "https://utah-rugby-alumni.vercel.app",
  unsubscribeUrl,
}: WeeklyDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>This week in the Utah Rugby alumni network</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>This Week in the Network</Heading>
            <Text style={textStyle}>Hi {firstName},</Text>

            {newAlumni.length > 0 && (
              <>
                <Text style={sectionTitleStyle}>New teammates joined</Text>
                {newAlumni.map((a, i) => (
                  <Text key={i} style={listItemStyle}>
                    • {a.firstName} {a.lastName}
                    {a.gradYear ? ` ('${String(a.gradYear).slice(-2)})` : ""}
                  </Text>
                ))}
              </>
            )}

            {upcomingEvents.length > 0 && (
              <>
                <Text style={sectionTitleStyle}>Coming up</Text>
                {upcomingEvents.map((e, i) => (
                  <Text key={i} style={listItemStyle}>
                    • <Link href={e.url} style={linkStyle}>{e.title}</Link> — {e.date}
                    {e.location ? ` · ${e.location}` : ""}
                  </Text>
                ))}
              </>
            )}

            {postsCount > 0 && (
              <Text style={textStyle}>
                {postsCount} {postsCount === 1 ? "post" : "posts"} hit the alumni
                wall this week.
              </Text>
            )}

            <Text style={textStyle}>
              <Link href={appUrl} style={linkStyle}>
                Open the network →
              </Link>
            </Text>

            <Text style={textStyle}>— Moose</Text>
          </Section>
          {unsubscribeUrl && (
            <Section style={{ marginTop: "32px", borderTop: "1px solid #e5e5e5", paddingTop: "16px" }}>
              <Text style={footerStyle}>
                <Link href={unsubscribeUrl} style={footerLinkStyle}>
                  Unsubscribe
                </Link>{" "}
                from future emails
              </Text>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  );
}

export default WeeklyDigestEmail;

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

const headingStyle = {
  fontSize: "22px",
  lineHeight: "28px",
  color: "#111111",
  fontWeight: 800 as const,
};

const sectionTitleStyle = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#CC0000",
  fontWeight: 700 as const,
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  marginTop: "24px",
};

const textStyle = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
};

const listItemStyle = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#333333",
  margin: "2px 0",
};

const linkStyle = {
  color: "#CC0000",
  textDecoration: "underline",
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
