import { expect, test } from '@playwright/test'

test('loads the public workbench shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Acrobat’s daily chores/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Star on GitHub/i })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/pdf-workbench'
  )
  await expect(page.getByText(/Version/)).toBeVisible()
})
