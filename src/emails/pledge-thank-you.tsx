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

interface PledgeThankYouEmailProps {
  donorName: string;
  campaignName: string;
  amountFormatted: string; // e.g. "$250"
  paymentMethod: string;   // e.g. "check", "Venmo"
  boardSignature?: string;
  unsubscribeUrl?: string;
}

export function PledgeThankYouEmail({
  donorName = "Friend",
  campaignName = "Utah Rugby Alumni Fund",
  amountFormatted = "$0",
  paymentMethod = "your generous contribution",
  boardSignature = "The Utah Rugby Alumni Board",
  unsubscribeUrl,
}: PledgeThankYouEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Thank you for your donation to {campaignName}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={headingStyle}>Utah Rugby Alumni</Text>

            <Text style={textStyle}>Hi {donorName},</Text>

            <Text style={textStyle}>
              On behalf of the Utah Rugby Alumni board, thank you for your
              donation of <strong>{amountFormatted}</strong> to{" "}
              <strong>{campaignName}</strong>.
            </Text>

            <Text style={textStyle}>
              Your support means a great deal to the program and to the alumni
              community we&apos;re building together. We received your
              contribution via <strong>{paymentMethod}</strong> and it has been
              recorded.
            </Text>

            <Text style={textStyle}>
              If you have any questions about your donation or our programs,
              just reply to this email.
            </Text>

            <Text style={textStyle}>
              Go Utes,
              <br />
              {boardSignature}
            </Text>
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

export default PledgeThankYouEmail;

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
  fontSize: "13px",
  fontWeight: "700" as const,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#CC0000",
  marginBottom: "24px",
};

const textStyle = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
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
