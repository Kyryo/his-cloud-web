import { identicon } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

export function createIdenticonDataUri(seed: string): string {
  return createAvatar(identicon, {
    seed,
    size: 128,
    radius: 8,
  }).toDataUri();
}
