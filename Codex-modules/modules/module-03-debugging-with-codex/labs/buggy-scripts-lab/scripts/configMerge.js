const defaults = {
  host: "api.example.com",
  retries: 3,
  timeout: 5000
};

let overrides = {};

if (process.env.CONFIG_OVERRIDES) {
  try {
    overrides = JSON.parse(process.env.CONFIG_OVERRIDES);
  } catch (error) {
    console.warn("Ignoring invalid CONFIG_OVERRIDES JSON:", error.message);
  }
}

const consolidated = { ...defaults, ...overrides };
console.log("Merged configuration:", consolidated);
