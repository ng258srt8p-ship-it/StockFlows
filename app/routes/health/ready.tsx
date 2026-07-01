export const loader = async () => {
  console.error("[health/ready] loader called");
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};