const env = process.env;
export const config = {
  port: Number(env.PORT ?? 4500),
  isProd: env.NODE_ENV === "production",
  trustProxy: Number(env.TRUST_PROXY ?? 0),
  keys: {
    github: env.GITHUB_TOKEN || undefined,
    stackApps: env.STACK_APPS_KEY || undefined,
    nvd: env.NVD_API_KEY || undefined,
  },
};
