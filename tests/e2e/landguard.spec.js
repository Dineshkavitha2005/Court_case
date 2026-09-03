const { test, expect } = require('@playwright/test');

test.describe('LandGuard Due Diligence E2E Suite', () => {

    test('1. Valid search displays verified demo report with court cases and risk breakdown', async ({ page }) => {
        await page.goto('/');

        // Verify title
        await expect(page).toHaveTitle(/LandGuard/);

        // Select District: Coimbatore
        const distSelect = page.locator('#districtSelect');
        await distSelect.waitFor();
        await distSelect.selectOption({ label: 'Coimbatore' });

        // Select Taluk: Coimbatore South
        const talukSelect = page.locator('#talukSelect');
        await expect(talukSelect).toBeEnabled();
        await talukSelect.selectOption({ label: 'Coimbatore South' });

        // Enter Village
        const villageInput = page.locator('#villageInput');
        await expect(villageInput).toBeEnabled();
        await villageInput.fill('Alanthurai (TP)');

        // Enter Survey Number
        const surveyInput = page.locator('#surveyInput');
        await surveyInput.fill('142/1');

        // Submit form
        await page.locator('#searchBtn').click();

        // Verify Results Section appears
        const resultsSection = page.locator('#resultsSection');
        await expect(resultsSection).toBeVisible({ timeout: 6000 });

        // Verify Demo Banner is prominently displayed
        const demoBanner = page.locator('#demoBanner');
        await expect(demoBanner).toBeVisible();
        await expect(demoBanner).toContainText('DEMO RECORD');

        // Verify Risk Gauge & Score
        const riskLevel = page.locator('#riskLevel');
        await expect(riskLevel).toContainText('HIGH RISK');

        // Verify Court Case details
        const courtCard = page.locator('#courtCard');
        await expect(courtCard).toContainText('OS No. 342/2022');
        await expect(courtCard).toContainText('Active Interim Injunction');

        // Verify Leaflet Map is mounted
        const mapEl = page.locator('#gisMap');
        await expect(mapEl).toBeVisible();

        // Verify Sources section
        const sourcesCard = page.locator('#sourcesCard');
        await expect(sourcesCard).toContainText('Statutory Land Revenue Registry');
    });

    test('2. Invalid survey number triggers client validation alert', async ({ page }) => {
        await page.goto('/');

        await page.locator('#districtSelect').selectOption({ label: 'Coimbatore' });
        await page.locator('#talukSelect').selectOption({ label: 'Coimbatore South' });
        await page.locator('#villageInput').fill('Alanthurai (TP)');
        await page.locator('#surveyInput').fill('INVALID*SURVEY#$$');

        await page.locator('#searchBtn').click();

        const alertBox = page.locator('#validationAlert');
        await expect(alertBox).toBeVisible();
        await expect(alertBox).toContainText('Invalid survey number format');
    });

    test('3. Empty fields trigger required validation alert', async ({ page }) => {
        await page.goto('/');

        // Click search without selecting district
        await page.locator('#searchBtn').click();

        const alertBox = page.locator('#validationAlert');
        await expect(alertBox).toBeVisible();
        await expect(alertBox).toContainText('select a District');
    });

    test('4. Unknown village or survey returns clean No Verified Record Found', async ({ page }) => {
        await page.goto('/');

        await page.locator('#districtSelect').selectOption({ label: 'Coimbatore' });
        await page.locator('#talukSelect').selectOption({ label: 'Coimbatore South' });
        await page.locator('#villageInput').fill('Alanthurai (TP)');
        await page.locator('#surveyInput').fill('9999/999');

        await page.locator('#searchBtn').click();

        // Verify results section is displayed
        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 6000 });

        // Verify No Record Card is shown
        const noRecordCard = page.locator('#noRecordCard');
        await expect(noRecordCard).toBeVisible();
        await expect(noRecordCard).toContainText('No Verified Record Found');

        // Verify official next steps links are present
        await expect(page.locator('#noRecordStepsList')).toContainText('Tamil Nadu e-Services');
        await expect(page.locator('#noRecordStepsList')).toContainText('TNREGINET');

        // Verify verified content container is hidden
        await expect(page.locator('#verifiedResultsContainer')).toBeHidden();
    });

    test('5. Autocomplete displays multiple matching village suggestions', async ({ page }) => {
        await page.goto('/');

        await page.locator('#districtSelect').selectOption({ label: 'Coimbatore' });
        await page.locator('#talukSelect').selectOption({ label: 'Coimbatore South' });

        const villageInput = page.locator('#villageInput');
        await villageInput.fill('Al');

        // Verify suggestions dropdown appears
        const dropdown = page.locator('#villageSuggestions');
        await expect(dropdown).toBeVisible({ timeout: 4000 });
        const items = dropdown.locator('.suggestion-item');
        await expect(items.first()).toBeVisible();
    });

    test('6. No verified record guarantees zero fabricated court cases or owners in DOM', async ({ page }) => {
        await page.goto('/');

        await page.locator('#districtSelect').selectOption({ label: 'Chennai' });
        await page.locator('#talukSelect').selectOption({ label: 'Velachery' });
        await page.locator('#villageInput').fill('Velachery');
        await page.locator('#surveyInput').fill('888/9Z');

        await page.locator('#searchBtn').click();

        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 6000 });
        await expect(page.locator('#noRecordCard')).toBeVisible();

        // Check DOM content: no fabricated fake names or fake OS numbers
        const bodyText = await page.innerText('body');
        expect(bodyText).not.toContain('Arun Kumar');
        expect(bodyText).not.toContain('Bala Pillai');
        expect(bodyText).not.toContain('XXXX-XXXX-');
    });

    test('7. Tamil input and interface localization toggle', async ({ page }) => {
        await page.goto('/');

        // Click language switcher
        const langToggle = page.locator('#languageToggle');
        await langToggle.click({ force: true });

        // Verify Tamil text elements using specific selectors
        const searchTitle = page.locator('#search-section .section-title');
        await expect(searchTitle).toContainText('நில பதிவுகளை தேடுங்கள்');
        await expect(page.locator('#searchBtn')).toContainText('வழக்கு அபாயத்தை சரிபார்க்கவும்');
        await expect(langToggle).toContainText('English');

        // Switch back
        await langToggle.click({ force: true });
        await expect(searchTitle).toContainText('Search Land Records');
    });

    test('8. Voice UI controls toggle listening state banner', async ({ page }) => {
        await page.goto('/');

        const voiceBtn = page.locator('#voiceBtn');
        await expect(voiceBtn).toBeVisible();

        // Click Voice button
        await voiceBtn.click();

        // Voice banner or microphone error banner
        const banner = page.locator('#voiceStatusBanner');
        const alert = page.locator('#validationAlert');

        const bannerOrAlertVisible = (await banner.isVisible()) || (await alert.isVisible());
        expect(bannerOrAlertVisible).toBe(true);

        // Cancel voice if open
        if (await banner.isVisible()) {
            await page.locator('#voiceCancelBtn').click();
            await expect(banner).toBeHidden();
        }
    });

    test('9. API failure handling displays error alert gracefully without crash', async ({ page }) => {
        await page.goto('/');

        // Intercept search API to return 500 error
        await page.route('/api/land/search', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'error', error: 'Database query timeout.' })
            });
        });

        await page.locator('#districtSelect').selectOption({ label: 'Coimbatore' });
        await page.locator('#talukSelect').selectOption({ label: 'Coimbatore South' });
        await page.locator('#villageInput').fill('Alanthurai (TP)');
        await page.locator('#surveyInput').fill('142/1');

        await page.locator('#searchBtn').click();

        // Verify alert is shown and page is still responsive
        const alertBox = page.locator('#validationAlert');
        await expect(alertBox).toBeVisible();
        await expect(alertBox).toContainText('Database query timeout.');
    });

    test('10. Mobile viewport rendering (375x667) verifies responsive layout', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Verify form layout and brand
        await expect(page.locator('.navbar .nav-logo')).toBeVisible();
        await expect(page.locator('#searchForm')).toBeVisible();
        await expect(page.locator('#searchBtn')).toBeVisible();

        // Confirm button is rendered with valid dimensions
        const searchBtnBox = await page.locator('#searchBtn').boundingBox();
        expect(searchBtnBox.width).toBeGreaterThan(100);
    });

});
