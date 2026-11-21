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

    test('8a. Voice transcript is parsed, reviewed, and only searched after confirmation', async ({ page }) => {
        await page.addInitScript(() => {
            class FakeSpeechRecognition {
                constructor() { window.__voiceRecognition = this; }
                start() { this.started = true; }
                stop() { this.stopped = true; }
            }
            window.SpeechRecognition = FakeSpeechRecognition;
        });
        await page.goto('/');

        await page.locator('#voiceBtn').click();
        await expect(page.locator('#voiceStatusBanner')).toBeVisible();
        await page.evaluate(() => window.__voiceRecognition.onresult({
            results: [[{ transcript: 'District Coimbatore Taluk Coimbatore South Village Alanthurai Survey one four two slash one' }]]
        }));

        const review = page.locator('#voiceReview');
        await expect(review).toBeVisible();
        await expect(review).toContainText('Coimbatore South');
        await expect(review).toContainText('Alanthurai (TP)');
        await expect(review).toContainText('142/1');
        const confirm = page.locator('#voiceConfirmBtn');
        await expect(confirm).toBeEnabled();
        await expect(page.locator('#resultsSection')).toBeHidden();

        await confirm.click();
        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 6000 });
    });

    test('8b. Ambiguous voice location shows choices and does not choose a taluk', async ({ page }) => {
        await page.addInitScript(() => {
            class FakeSpeechRecognition {
                constructor() { window.__voiceRecognition = this; }
                start() {}
                stop() {}
            }
            window.SpeechRecognition = FakeSpeechRecognition;
        });
        await page.goto('/');
        await page.route('**/api/taluks?district=Coimbatore', route => route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ status: 'success', taluks: [{ name: 'Coimbatore North' }, { name: 'Coimbatore South' }] })
        }));

        await page.locator('#voiceBtn').click();
        await page.evaluate(() => window.__voiceRecognition.onresult({
            results: [[{ transcript: 'district Coimbatore taluk Coimbatore survey 142 slash 1' }]]
        }));

        const review = page.locator('#voiceReview');
        await expect(review).toBeVisible();
        await expect(review).toContainText('More than one taluk matches');
        await expect(review.locator('[data-voice-field="taluk"]')).toHaveCount(2);
        await expect(page.locator('#voiceConfirmBtn')).toBeDisabled();
    });

    test('8c. Voice network errors give an actionable recovery message', async ({ page }) => {
        await page.addInitScript(() => {
            class FakeSpeechRecognition {
                constructor() { window.__voiceRecognition = this; }
                start() {}
                stop() {}
            }
            window.SpeechRecognition = FakeSpeechRecognition;
        });
        await page.goto('/');
        await page.locator('#voiceBtn').click();
        await page.evaluate(() => window.__voiceRecognition.onerror({ error: 'network' }));
        await expect(page.locator('#validationAlert')).toContainText('network error');
    });

    test('8d. Denied microphone permission gives browser-settings guidance', async ({ page }) => {
        await page.addInitScript(() => {
            class FakeSpeechRecognition {
                constructor() { window.__voiceRecognition = this; }
                start() {}
                stop() {}
            }
            window.SpeechRecognition = FakeSpeechRecognition;
        });
        await page.goto('/');
        await page.locator('#voiceBtn').click();
        await page.evaluate(() => window.__voiceRecognition.onerror({ error: 'not-allowed' }));
        await expect(page.locator('#validationAlert')).toContainText('Microphone permission denied');
        await expect(page.locator('#validationAlert')).toContainText('browser settings');
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

    test('11. Provenance audit trail: verifies source name, verification dates, and DEMO provenance in DOM', async ({ page }) => {
        await page.goto('/');

        // Search benchmark parcel 142/1 in Alanthurai, Coimbatore
        await page.locator('#districtSelect').selectOption({ label: 'Coimbatore' });
        await page.locator('#talukSelect').selectOption({ label: 'Coimbatore South' });
        await page.locator('#villageInput').fill('Alanthurai (TP)');
        await page.locator('#surveyInput').fill('142/1');
        await page.locator('#searchBtn').click();

        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 6000 });

        // 1. Verify Ownership Provenance Display
        const ownerCard = page.locator('#ownerCard');
        await expect(ownerCard).toBeVisible();
        await expect(ownerCard.locator('.provenance-source')).toContainText('Tamil Nadu Land Records Registry');
        await expect(ownerCard.locator('.provenance-date')).toContainText('01-09-2026');
        await expect(ownerCard).toContainText('DEMO');
        await expect(ownerCard).toContainText('Not Admissible as Legal Evidence');

        // 2. Verify Court Cases Provenance Display
        const courtCard = page.locator('#courtCard');
        await expect(courtCard).toBeVisible();
        await expect(courtCard.locator('.provenance-source').first()).toContainText('eCourts Services (NJDG)');
        await expect(courtCard.locator('.provenance-date').first()).toContainText('28-08-2026');
        await expect(courtCard.locator('.status-badge').first()).toContainText('DEMO');
        await expect(courtCard).toContainText('Not Admissible as Legal Evidence');

        // 3. Verify Encumbrance Provenance Display
        const encCard = page.locator('#encCard');
        await expect(encCard).toBeVisible();
        await expect(encCard.locator('.provenance-source').first()).toContainText('TNREGINET');
        await expect(encCard.locator('.provenance-date').first()).toContainText('22-11-2022');
        await expect(encCard).toContainText('DEMO');
        await expect(encCard).toContainText('Not Admissible as Legal Evidence');

        // 4. Verify Sources & Audit Trail Card Display
        const sourcesCard = page.locator('#sourcesCard');
        await expect(sourcesCard).toBeVisible();
        await expect(sourcesCard).toContainText('Statutory Land Revenue Registry');
        await expect(sourcesCard).toContainText('Judicial Case Status Portal');
        await expect(sourcesCard).toContainText('Encumbrance & Registration Records');
        const sourcesDates = sourcesCard.locator('.provenance-date');
        await expect(sourcesDates.first()).toBeVisible();
    });

});
