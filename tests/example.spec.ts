import { GUEST_MODE_COOKIE, GUEST_MODE_COOKIE_DEV_ID } from '@/lib/data';
import { expect, test } from '@playwright/test';

test('can submit as guest', async ({ browser }) => {
  // New context ensures clean cookies and storage
  const context = await browser.newContext();
  context.clearCookies();
  const page = await context.newPage();

  await page.goto('/playground/demo/smart/1');

  // Check guest cookie is not present
  expect(
    (await context.cookies()).find(
      (cookie) => cookie.name === GUEST_MODE_COOKIE
    )
  ).toBeUndefined();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Cloudybook App/);

  const specificInput = page.getByPlaceholder('Type your answer here');

  const inputValue = 'Specific input';
  await specificInput.fill(inputValue);

  await page.waitForFunction((e) => {
    return localStorage['cloudybook.demo.smart.I_TEXT.specific'] === e;
  }, inputValue);

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page).toHaveURL('/register');

  await page.getByRole('button', { name: 'Continue with guest mode' }).click();

  await expect(page).toHaveURL('/playground/demo/smart/1');

  // Check guest cookie is present
  expect(
    (await context.cookies()).find(
      (cookie) => cookie.name === GUEST_MODE_COOKIE
    )?.value
  ).toBe(GUEST_MODE_COOKIE_DEV_ID);

  await page.getByRole('button', { name: 'Submit' }).click();

  const spanSelector = `span:has-text("${inputValue}")`;
  await page.waitForSelector(spanSelector);
  await page.locator(spanSelector).waitFor();
  await expect(page.locator(spanSelector)).toHaveText('Specific input');
});
