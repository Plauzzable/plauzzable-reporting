import AWS from "aws-sdk";
AWS.config.update({ region: "us-east-1" });

const decrypt_env_var = async (envVariable) => {
    const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
    const encrypted = process.env[envVariable];
  
    const kms = new AWS.KMS();
    try {
      const req = {
        CiphertextBlob: Buffer.from(encrypted, "base64"),
        EncryptionContext: { LambdaFunctionName: functionName },
      };    
      const data = await kms.decrypt(req).promise();    
      return data.Plaintext.toString("ascii");
    } catch (err) {
      console.log("Decrypt error:", err);
      throw err;
    }
  };
  
  export { decrypt_env_var };