const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8082/games/game-001/index.html');
  await page.waitForTimeout(5000);
  const state = await page.evaluate(() => {
    const g = window.__phaserGame;
    if (!g) return { error: 'no game' };
    return {
      activeScenes: g.scene.scenes.filter(s => s.sys.isActive()).map(s => s.sys.settings.key),
    };
  });
  console.log('State:', JSON.stringify(state));
  console.log('Console errors:', errors);
  if (errors.length || state.error) { console.log('FAIL'); process.exit(1); }
  if (!state.activeScenes.includes('Game')) { console.log('FAIL - Game scene not active'); process.exit(1); }
  console.log('PASS');
  await browser.close();
})();
