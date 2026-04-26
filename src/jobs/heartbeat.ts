import type { JobDefinition } from "./index";

export const heartbeat: JobDefinition = {
  name: "heartbeat",
  schedule: "0 * * * *", // every hour
  async run() {
    return { ok: true, timestamp: new Date().toISOString() };
  },
};
