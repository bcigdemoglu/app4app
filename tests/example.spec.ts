import { GUEST_MODE_COOKIE, GUEST_MODE_COOKIE_DEV_ID } from '@/lib/data';
import { expect, test } from '@playwright/test';

test('can submit as guest', async ({ browser }) => {
  // New context ensures clean cookies and storage
  const context = await browser.newContext();
  context.clearCookies();
  const page = await context.newPage();

  await page.goto('/playground/demo/smart');
  await expect(page).toHaveURL('/playground/demo/smart/1?welcome=true');

  // Check guest cookie is not present
  expect(
    (await context.cookies()).find(
      (cookie) => cookie.name === GUEST_MODE_COOKIE
    )
  ).toBeUndefined();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Cloudybook App/);

  await page.locator('#next-section').click();
  await page.locator('#next-section').click();
  await page.getByPlaceholder('Type your answer here...').click();
  await page
    .getByPlaceholder('Type your answer here...')
    .fill('Test input to specific!');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.goto('/register');
  await page.getByRole('button', { name: 'Continue with guest mode' }).click();

  await expect(page).toHaveURL('/playground/demo/smart/1');
  // Check guest cookie is present
  expect(
    (await context.cookies()).find(
      (cookie) => cookie.name === GUEST_MODE_COOKIE
    )?.value
  ).toBe(GUEST_MODE_COOKIE_DEV_ID);
  // verify local storage for input field
  await expect(page.getByPlaceholder('Type your answer here...')).toHaveValue(
    'Test input to specific!'
  );
  // Add a new input to re-active submit if disabled
  await page
    .getByPlaceholder('Type your answer here...')
    .fill('Test input 2 to specific!');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('#output-tab')).toContainText(
    'Test input 2 to specific!'
  );
  await page.locator('#next-section').click();

  await expect(page).toHaveURL('/playground/demo/smart/2');
  await page.getByPlaceholder('Type your answer here...').click();
  await page
    .getByPlaceholder('Type your answer here...')
    .fill('Test input to measurable!');
  await page.locator('#reset-section').click();
  await expect(page.getByPlaceholder('Type your answer here...')).toBeEmpty();
  // await page.getByPlaceholder('Type your answer here...').click();
  // await page.getByPlaceholder('Type your answer here...').fill('T');
  await page.getByPlaceholder('Type your answer here...').click();
  await page
    .getByPlaceholder('Type your answer here...')
    .fill('Test input to measurable!');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('#output-tab')).toContainText(
    'Test input to measurable!'
  );
  await page.locator('#export-output').click();

  // await expect(page).toHaveURL('playground/output/.*');
  await expect(page.locator('body')).toContainText('Test input to measurable!');

  // Go back to the playground
  await page.goto('/playground/demo/smart/2');
  await page.locator('#prev-section').click();

  await expect(page).toHaveURL('/playground/demo/smart/1');
  await expect(page.getByPlaceholder('Type your answer here...')).toHaveValue(
    'Test input 2 to specific!'
  );
  await expect(page.locator('#output-tab')).toContainText(
    'Test input to measurable!'
  );
  await page.getByRole('button', { name: 'Reset Lesson' }).click();

  // Ensure lesson is reset
  await expect(page).toHaveURL('/playground/demo/smart/1?welcome=true');
  await page.locator('#next-section').click();
  await expect(page).toHaveURL('/playground/demo/smart/1');
  await expect(page.getByPlaceholder('Type your answer here...')).toBeEmpty();
  await expect(page.locator('#output-tab')).toContainText(
    'Please fill out all fields in playground'
  );
});
