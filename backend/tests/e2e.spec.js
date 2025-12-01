// tests/e2e.spec.js (END-TO-END TESTS - Playwright)

import { test, expect } from '@playwright/test';

test.describe('MindfulPath E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Complete user journey from signup to report', async ({ page }) => {
    // 1. Welcome page
    await expect(page.locator('text=MindfulPath')).toBeVisible();
    await page.click('button:has-text("Get Started")');

    // 2. Registration
    await page.fill('input[type="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.fill('input[placeholder="First Name"]', 'John');
    await page.fill('input[placeholder="Last Name"]', 'Doe');
    
    // Accept consents
    await page.check('input[name="terms_accepted"]');
    await page.check('input[name="privacy_accepted"]');
    await page.check('input[name="consent_accepted"]');
    
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL('**/dashboard');

    // 3. Dashboard
    await expect(page.locator('text=Welcome')).toBeVisible();
    await page.click('button:has-text("Start Free Assessment")');

    // 4. Level 1 Assessment
    await page.waitForURL('**/assessment/level1');
    
    // Answer all 12 questions
    for (let i = 0; i < 12; i++) {
      await page.click(`input[value="A"][name*="question-${i}"]`);
      if (i < 11) {
        await page.click('button:has-text("Next")');
      }
    }

    // Submit
    await page.click('button:has-text("Submit Assessment")');
    await page.waitForURL('**/upgrade/level2');

    // 5. Payment Upgrade
    await page.click('button:has-text("Unlock Level 2")');
    await page.waitForURL('**/assessment/level2');

    // 6. Level 2 Assessment (similar to L1)
    for (let i = 0; i < 12; i++) {
      await page.click(`input[value="B"][name*="question-${i}"]`);
      if (i < 11) {
        await page.click('button:has-text("Next")');
      }
    }
    await page.click('button:has-text("Submit Assessment")');

    // 7. View Report
    await page.goto('http://localhost:3000/report');
    await expect(page.locator('text=Your Wellness Report')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible(); // Radar chart

    // 8. Log Practice
    await page.goto('http://localhost:3000/dashboard');
    await page.click('button:has-text("Log Practice")');
    await page.selectOption('select', 'meditation');
    await page.fill('input[type="number"]', '15');
    await page.click('button:has-text("Log Practice")');

    // 9. Verify gamification
    await expect(page.locator('text=🔥')).toBeVisible(); // Streak
    await expect(page.locator('text=🏆')).toBeVisible(); // Badges

    // 10. Community
    await page.goto('http://localhost:3000/community');
    await expect(page.locator('text=Community')).toBeVisible();
    await expect(page.locator('text=General Discussion')).toBeVisible();
  });

  test('Admin can upload content', async ({ page }) => {
    // Login as admin (assuming admin account exists)
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button:has-text("Sign In")');

    // Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();

    // Go to content management
    await page.click('a:has-text("Content Management")');
    await page.click('button:has-text("Add Content")');

    // Fill form
    await page.fill('input[placeholder="Title"]', 'Test Meditation');
    await page.fill('textarea[placeholder="Description"]', 'A test meditation session');
    await page.fill('input[placeholder="Instructor"]', 'John Smith');
    await page.fill('input[type="number"]', '20');

    // Submit
    await page.click('button:has-text("Upload Content")');
    await expect(page.locator('text=Test Meditation')).toBeVisible();
  });

  test('User can create and reply to forum posts', async ({ page }) => {
    // Assume logged in
    const email = `test_${Date.now()}@example.com`;
    
    // Register
    await page.click('button:has-text("Get Started")');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.check('input[name="terms_accepted"]');
    await page.check('input[name="privacy_accepted"]');
    await page.check('input[name="consent_accepted"]');
    await page.click('button:has-text("Sign Up")');

    // Go to community
    await page.goto('http://localhost:3000/community');
    await page.click('text=General Discussion');

    // Create thread
    await page.click('button:has-text("Start New Thread")');
    await page.fill('input[placeholder="Thread Title"]', 'My First Experience');
    await page.fill('textarea[placeholder="Thread Description"]', 'I just started my mindfulness journey...');
    await page.click('button:has-text("Create Thread")');

    // Reply to thread
    await expect(page.locator('text=My First Experience')).toBeVisible();
    await page.click('text=My First Experience');
    await page.fill('textarea[placeholder="Share your thoughts..."]', 'Great experience!');
    await page.click('button:has-text("Post Reply")');

    // Verify post
    await expect(page.locator('text=Great experience!')).toBeVisible();
  });
});
