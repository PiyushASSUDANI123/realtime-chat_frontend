const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Expose a function to window to trigger the crash
  await page.evaluate(() => {
    // find the NoteEditor React component instance (or just trigger via window event if we had one)
    // Actually, I can just dispatch the secret-trigger custom event since I implemented it!
    window.dispatchEvent(new CustomEvent('secret-trigger', { detail: { role: 'admin', user: {id: 1, username: 'piyush'} } }));
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // See if the DOM is empty
  const html = await page.evaluate(() => document.body.innerHTML);
  if (!html.includes('chat-panel')) {
    console.log('CRASH CONFIRMED. HTML:', html.substring(0, 500));
  } else {
    console.log('Chat Panel Rendered Successfully.');
  }
  
  await browser.close();
})();
