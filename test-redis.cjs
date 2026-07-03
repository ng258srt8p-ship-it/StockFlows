const { checkRedisHealth } = require("./app/lib/jobs/redis-connection");

async function run() {
  console.log("Checking Redis health...");
  try {
    const health = await checkRedisHealth();
    console.log("Result:", health);
  } catch (err) {
    console.error("Error checking redis health:", err);
  }
}

run();
