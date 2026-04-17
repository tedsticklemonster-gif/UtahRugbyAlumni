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

interface MooseIntroEmailProps {
  firstName: string;
  profileLink: string;
  forwardLink: string;
}

export function MooseIntroEmail({
  firstName = "Friend",
  profileLink = "https://alumni.utah-rugby.com/join",
  forwardLink = "https://alumni.utah-rugby.com/forward/example",
}: MooseIntroEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Hey it&apos;s Moose — we&apos;re building the Utah Rugby alumni network</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={textStyle}>Hi {firstName},</Text>

            <Text style={textStyle}>
              It&apos;s Moose (Richard White, played &apos;04–&apos;08).
            </Text>

            <Text style={textStyle}>
              It&apos;s kind of wild that with as much Utah Rugby history as there is,
              we don&apos;t have a good way to stay in touch. A few of us are fixing
              that — building an alumni network where you can see who played
              when, what everyone&apos;s up to, and connect with each other
              professionally. We&apos;ll also use it for game-day texts and
              announcements like the alumni banquet (only if you opt in — no
              spam).
            </Text>

            <Text style={textStyle}>
              If you played, here&apos;s the 2-minute profile form:{" "}
              <Link href={profileLink} style={linkStyle}>
                {profileLink}
              </Link>
            </Text>

            <Text style={textStyle}>
              It&apos;d help us a ton if you&apos;d add your cell number so we can text
              you game updates.
            </Text>

            <Text style={textStyle}>
              Even if you didn&apos;t play — we need your help. Utah Rugby has
              almost no contact info for alumni. If you know anyone who played,
              please forward this email to them or send them this link:{" "}
              <Link href={forwardLink} style={linkStyle}>
                {forwardLink}
              </Link>
            </Text>

            <Text style={textStyle}>
              Thanks — let&apos;s build this thing.
            </Text>

            <Text style={textStyle}>Moose</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default MooseIntroEmail;

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
