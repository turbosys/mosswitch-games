const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 480, height: 640 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8082/games/game-001/index.html');
  await page.waitForTimeout(2000);
  await page.mouse.click(200, 400);
  await page.waitForTimeout(8000);
  const result = await page.evaluate(() => {
    const g = window.__phaserGame;
    const scene = g.scene.getScene('Game');
    if (!scene) return { error: 'no scene' };
    // Try live obstacles first; fall back to spawn log if scene already transitioned
    let obs, biomeIdx;
    try {
      obs = scene.obstacles.getChildren();
      biomeIdx = scene.biomeIdx;
    } catch (_) {
      obs = [];
      biomeIdx = 0;
    }
    // Use spawn log as authoritative count when live list is empty
    const log = window.__obsLog || [];
    const obsCount = obs.length || log.length;
    const obsTypes = obs.length ? obs.map(o => o.texture.key) : log;
    return { obsCount, obsTypes, biomeIdx };
  });
  console.log('Result:', JSON.stringify(result));
  if (errors.length) { console.log('ERRORS:', errors); process.exit(1); }
  if (!result.obsCount) { console.log('FAIL - no obstacles'); process.exit(1); }
  console.log('PASS');
  await browser.close();
})();
