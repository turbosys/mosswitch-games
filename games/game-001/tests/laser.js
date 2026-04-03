const { chromium } = require('/Users/turbonoob/.openclaw/workspace/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8082/games/game-001/index.html');
  await page.waitForTimeout(2000);
  await page.mouse.click(200, 400); // start
  // Force laser pickup via console injection
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const scene = window.__phaserGame.scene.getScene('Game');
    scene.collectPowerup('laser');
  });
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => {
    const scene = window.__phaserGame.scene.getScene('Game');
    return {
      hasBeam: !!scene.laserBeam && scene.laserBeam.visible,
      activePowerup: scene.activePowerup?.type,
      laserSpawnMult: scene.laserSpawnMult,
    };
  });
  console.log('Result:', JSON.stringify(result));
  if (!result.hasBeam) { console.log('FAIL - no beam visible'); process.exit(1); }
  if (result.activePowerup !== 'laser') { console.log('FAIL - wrong powerup'); process.exit(1); }
  if (result.laserSpawnMult !== 2) { console.log('FAIL - laserSpawnMult not 2'); process.exit(1); }
  console.log('PASS');
  await browser.close();
})();
