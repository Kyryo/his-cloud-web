function base64UrlToBuffer(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(`${padded}${"=".repeat(padLength)}`);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function decodeChallenge(options: Record<string, unknown>): PublicKeyCredentialRequestOptions {
  const allowCredentials = Array.isArray(options.allowCredentials)
    ? options.allowCredentials.map((item) => {
        const credential = asRecord(item);
        return {
          ...credential,
          id: typeof credential.id === "string"
            ? base64UrlToBuffer(credential.id)
            : credential.id,
        };
      })
    : undefined;

  return {
    ...options,
    challenge:
      typeof options.challenge === "string"
        ? base64UrlToBuffer(options.challenge)
        : options.challenge,
    allowCredentials,
  } as PublicKeyCredentialRequestOptions;
}

function decodeCreation(
  options: Record<string, unknown>,
): PublicKeyCredentialCreationOptions {
  const user = asRecord(options.user);
  const excludeCredentials = Array.isArray(options.excludeCredentials)
    ? options.excludeCredentials.map((item) => {
        const credential = asRecord(item);
        return {
          ...credential,
          id: typeof credential.id === "string"
            ? base64UrlToBuffer(credential.id)
            : credential.id,
        };
      })
    : undefined;

  return {
    ...options,
    challenge:
      typeof options.challenge === "string"
        ? base64UrlToBuffer(options.challenge)
        : options.challenge,
    user: {
      ...user,
      id:
        typeof user.id === "string" ? base64UrlToBuffer(user.id) : user.id,
    },
    excludeCredentials,
  } as PublicKeyCredentialCreationOptions;
}

function unwrapPublicKey(options: Record<string, unknown>): Record<string, unknown> {
  const nested = options.publicKey;
  if (nested && typeof nested === "object") {
    return asRecord(nested);
  }
  return options;
}

export function credentialToJson(
  credential: PublicKeyCredential,
): Record<string, unknown> {
  const response = credential.response;
  const jsonCredential: Record<string, unknown> = {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
  };

  if (response instanceof AuthenticatorAttestationResponse) {
    jsonCredential.response = {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports: response.getTransports?.() ?? [],
    };
  } else if (response instanceof AuthenticatorAssertionResponse) {
    jsonCredential.response = {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle
        ? bufferToBase64Url(response.userHandle)
        : null,
    };
  }

  return jsonCredential;
}

export function webAuthnErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Security key verification was cancelled or timed out.";
    }
    if (error.name === "InvalidStateError") {
      return "This security key is already registered.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Security key verification failed.";
}

export async function getWebAuthnAssertion(
  options: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const credential = await navigator.credentials.get({
    publicKey: decodeChallenge(unwrapPublicKey(options)),
  });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Security key verification failed.");
  }
  return credentialToJson(credential);
}

export async function createWebAuthnAttestation(
  options: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const credential = await navigator.credentials.create({
    publicKey: decodeCreation(unwrapPublicKey(options)),
  });
  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("Security key registration failed.");
  }
  return credentialToJson(credential);
}
