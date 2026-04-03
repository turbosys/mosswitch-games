const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 480, height: 640 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8082/games/game-001/index.html');
  await page.waitForTimeout(2000);
  await page.mouse.click(240, 320);
  await page.waitForTimeout(500);

  for (const type of ['fly', 'shroom', 'shield', 'laser', 'rage']) {
    await page.evaluate(t => {
      const scene = window.__phaserGame.scene.getScene('Game');
      scene.collectPowerup(t);
    }, type);
    await page.waitForTimeout(300);
    const state = await page.evaluate(() => {
      const s = window.__phaserGame.scene.getScene('Game');
      return { type: s.activePowerup?.type, dead: s.dead };
    });
    console.log(`${type}: active=${state.type}, dead=${state.dead}`);
    if (state.dead) { console.log(`FAIL - game died collecting ${type}`); process.exit(1); }
  }

  console.log('JS errors:', errors);
  if (errors.length) { console.log('FAIL - JS errors'); process.exit(1); }
  console.log('PASS');
  await browser.close();
})();
