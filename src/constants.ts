export const API_HOST =
  import.meta.env.MODE == "development"
    ? "http://localhost:3000"
    : "https://picperf-optimization.fly.dev";
