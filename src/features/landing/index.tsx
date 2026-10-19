import { StudioLanding } from "./studio-landing";
import "./studio.css";

export function Landing() {
  return <StudioLanding demoEnabled={process.env.AUTH_DEMO_ENABLED !== "false"} />;
}
