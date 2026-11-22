export function getPaymongoAuthorization(mode: unknown) {
  if (mode !== "test" && mode !== "live") {
    throw new Error("Could not determine the payment mode.");
  }

  const publicKey =
    mode === "test"
      ? process.env.NEXT_PUBLIC_PAYMONGO_TEST_PUBLIC_KEY
      : process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY;

  if (!publicKey?.startsWith(mode === "test" ? "pk_test_" : "pk_live_")) {
    throw new Error(`PayMongo public key is missing or does not match ${mode} mode.`);
  }

  return "Basic " + btoa(publicKey + ":");
}
