import type { Page } from "@playwright/test";

export async function fillVerificationCode(
  page: Page,
  testId: string,
  code: string,
): Promise<void> {
  for (let index = 0; index < code.length; index += 1) {
    await page.getByTestId(`${testId}-digit-${index}`).fill(code[index]);
  }
}
