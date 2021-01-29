import config from "config";

const getConfig = <T>(configPath: string, defaultValue?: T): T => {
  try {
    return config.get<T>(configPath);
  } catch (err) {
    if (typeof defaultValue !== "undefined") {
      return defaultValue;
    }
    throw err;
  }
};


export const APP_SECRET = getConfig<string | null>("app.secret", null);
export const APP_HOST = getConfig("app.host", "localhost");
export const APP_PORT = getConfig("app.port", 4000);
export const APP_PROXY = getConfig("app.proxy", false);

// Query Limit
export const QUERY_COMPLEXITY_LIMIT = getConfig("query.complexity-limit", 65535);

// Redis
export const REDIS_HOST = getConfig("redis.host", "localhost");
export const REDIS_PORT = getConfig("redis.port", 6379);
export const REDIS_PASSWORD = getConfig("redis.password", "");

// Database
export const PG_HOST = getConfig("postgresql.host", "localhost");
export const PG_PORT = getConfig("postgresql.port", 5432);
export const PG_USERNAME = getConfig("postgresql.username", "rosacourse");
export const PG_PASSWORD = getConfig("postgresql.password", "pa$$w0rd");
export const PG_DATABASE = getConfig("postgresql.database", "rosacourse");
