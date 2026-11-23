export function getPaymongoAuthorization(mode: unknown) {
  if (mode !== "test") {
    throw new Error("PayMongo test mode is required.");
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYMONGO_TEST_PUBLIC_KEY;
  if (!publicKey?.startsWith("pk_test_")) {
    throw new Error("PayMongo test public key is not configured.");
  }

  return "Basic " + btoa(publicKey + ":");
}
