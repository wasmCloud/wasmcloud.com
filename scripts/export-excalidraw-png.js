#!/usr/bin/env node
/**
 * Export Excalidraw diagrams to high-quality transparent PNGs using Playwright.
 *
 * - Disables background for transparency
 * - Sets export scale to 3x for high quality
 * - Uses clipboard copy for native rendering with Excalidraw fonts
 *
 * Setup:
 *   cd scripts && npm install && npx playwright install chromium
 *
 * Usage:
 *   node export-excalidraw-png.js <input.excalidraw> [output.png]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function exportDiagram(inputPath, outputPath) {
    const absoluteInput = path.resolve(inputPath);
    if (!fs.existsSync(absoluteInput)) {
        console.error(`Input file not found: ${absoluteInput}`);
        process.exit(1);
    }

    const diagramData = fs.readFileSync(absoluteInput, 'utf-8');
    const absoluteOutput = path.resolve(
        outputPath || inputPath.replace(/\.excalidraw$/, '.png')
    );

    console.log(`Exporting: ${path.basename(absoluteInput)}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1200 },
        permissions: ['clipboard-read', 'clipboard-write'],
    });
    const page = await context.newPage();
    page.on('dialog', (dialog) => dialog.accept());

    try {
        await page.goto('https://excalidraw.com/', { waitUntil: 'networkidle' });
        await page.waitForSelector('.excalidraw', { timeout: 30000 });
        await page.waitForTimeout(2000);

        // Load diagram via file drop
        await page.evaluate(async (content) => {
            const blob = new Blob([content], { type: 'application/json' });
            const file = new File([blob], 'diagram.excalidraw', {
                type: 'application/json',
            });
            const dt = new DataTransfer();
            dt.items.add(file);
            document.querySelector('.excalidraw')?.dispatchEvent(
                new DragEvent('drop', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dt,
                })
            );
        }, diagramData);

        await page.waitForTimeout(2000);

        // Select all elements
        await page.keyboard.press('Control+a');
        await page.waitForTimeout(500);

        // Open export dialog via menu
        const menuButton =
            (await page.$('button[aria-label="Main menu"]')) ||
            (await page.$('.App-menu button'));
        if (menuButton) await menuButton.click();
        await page.waitForTimeout(500);

        const exportOption =
            (await page.$('text="Export image..."')) ||
            (await page.$('text="Export image"')) ||
            (await page.$('[data-testid="dropdown-menu-export"]'));
        if (exportOption) {
            await exportOption.click();
        } else {
            await page.keyboard.press('Meta+Shift+e');
        }
        await page.waitForTimeout(1500);

        // Toggle OFF background for transparency
        const bgToggle = await page.$('label:has-text("Background")');
        if (bgToggle) {
            await bgToggle.click();
            await page.waitForTimeout(300);
            console.log('  Background: off');
        }

        // Set scale to 3x by clicking the third radio input in the Scale group
        await page.evaluate(() => {
            const labels = document.querySelectorAll('label');
            for (const label of labels) {
                if (label.textContent.trim() === 'Scale') {
                    const parent = label.closest('div') || label.parentElement;
                    if (parent) {
                        const inputs = parent.querySelectorAll(
                            'input[type="radio"], input'
                        );
                        if (inputs.length >= 3) inputs[2].click();
                    }
                    break;
                }
            }
        });
        await page.waitForTimeout(1000);
        console.log('  Scale: 3x');

        // Copy to clipboard (respects current scale and background settings)
        const copyBtn =
            (await page.$('button[aria-label="Copy PNG to clipboard"]')) ||
            (await page.$('button:has-text("Copy to clipboard")'));
        if (!copyBtn) throw new Error('Could not find "Copy to clipboard" button');

        await copyBtn.click();
        await page.waitForTimeout(3000);

        // Read PNG from clipboard
        const pngData = await page.evaluate(async () => {
            try {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    if (item.types.includes('image/png')) {
                        const blob = await item.getType('image/png');
                        const arrayBuffer = await blob.arrayBuffer();
                        const bytes = new Uint8Array(arrayBuffer);
                        let binary = '';
                        for (let i = 0; i < bytes.length; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        return btoa(binary);
                    }
                }
                return null;
            } catch (e) {
                return null;
            }
        });

        if (pngData && pngData.length > 100) {
            const buffer = Buffer.from(pngData, 'base64');
            if (buffer[0] === 0x89 && buffer[1] === 0x50) {
                fs.writeFileSync(absoluteOutput, buffer);
                console.log(
                    `  -> ${path.basename(absoluteOutput)} (${(buffer.length / 1024).toFixed(0)} KB)`
                );
            } else {
                throw new Error('Clipboard data is not a valid PNG');
            }
        } else {
            throw new Error('No PNG data in clipboard');
        }
    } catch (error) {
        console.error(`  Error: ${error.message}`);
        await browser.close();
        process.exit(1);
    }

    await browser.close();
}

const args = process.argv.slice(2);
if (args.length < 1) {
    console.log(
        'Usage: node export-excalidraw-png.js <input.excalidraw> [output.png]'
    );
    process.exit(1);
}

exportDiagram(args[0], args[1])
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
