const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 480, height: 640 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8082/games/game-001/');
  // Click to start game
  await page.click('canvas');
  await page.waitForTimeout(20000);
  const gameRunning = await page.evaluate(() => {
    const g = window.__phaserGame;
    if (!g) return false;
    const gameScene = g.scene.getScene('Game');
    const overScene = g.scene.getScene('GameOver');
    // Either Game scene still active, or GameOver scene active (normal death)
    return (gameScene && gameScene.scene.isActive()) || (overScene && overScene.scene.isActive());
  });
  console.log('errors:', errors);
  console.log('gameRunning:', gameRunning);
  if (errors.length > 0) { console.error('FAIL: console errors'); process.exit(1); }
  if (!gameRunning) { console.error('FAIL: game not running'); process.exit(1); }
  console.log('PASS');
  await browser.close();
})();
