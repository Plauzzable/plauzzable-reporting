import { DecryptCommand, KMSClient } from "@aws-sdk/client-kms";

const decrypt_env_var = async (envVariable) => {
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
  const encrypted = process.env[envVariable];

  const kmsClient = new KMSClient({ region: "us-east-1" });
  try {
    const input = {
      CiphertextBlob: Buffer.from(encrypted, "base64"),
      EncryptionContext: { LambdaFunctionName: functionName },
      EncryptionAlgorithm: "SYMMETRIC_DEFAULT",
    };
    console.log("Attempting to decrypt", envVariable, " with", input);
    const command = new DecryptCommand(input);
    const response = await kmsClient.send(command);
    return new TextDecoder().decode(response.Plaintext);
  } catch (err) {
    console.log("Decrypt error:", err);
    throw err;
  }
};

export { decrypt_env_var };