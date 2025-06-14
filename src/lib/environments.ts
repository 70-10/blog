export const isProduction = process.env.NODE_ENV === "production";

export const shouldSkipOgGeneration = process.env.SKIP_OG_GENERATION === "true";
