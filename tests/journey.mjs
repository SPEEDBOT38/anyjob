import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public');
const server=createServer(async(req,res)=>{
  const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return}
  try{const f=path===root?resolve(root,'index.html'):path;res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.woff2':'font/woff2'}[extname(f)]||'application/octet-stream'));res.end(await readFile(f))}catch{res.writeHead(404).end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chrome',headless:true});
const p=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
const route=async s=>{await p.goto(url+'/#/'+s);await p.waitForFunction(()=>document.querySelector('h1'))};
const btn=name=>p.getByRole('button',{name,exact:true});
const click=name=>btn(name).click(),anchor=name=>p.getByRole('link',{name,exact:true}).first().click();
const cv='Casey Doe\nExperience\n- Wrote SQL reports.\n- Built Python data pipelines.\nSkills\nSQL, Python';
try{
 await route('welcome');await anchor('How it works');await anchor('Privacy and trust');await anchor('Open app');
 await p.getByLabel('Target role').selectOption('Data analyst');await p.getByLabel('Upload your CV').setInputFiles({name:'resume.txt',mimeType:'text/plain',buffer:Buffer.from(cv)});await p.getByLabel('Review extracted CV').waitFor();await click('Enter workspace');await p.waitForURL('**/#/home');
 await anchor('Templates');for(const t of ['Modern','Compact','ATS plain','Classic'])await p.locator('.template').filter({has:p.getByRole('heading',{name:t,exact:true})}).getByRole('button').click();
 await anchor('Settings');await click('Show key');await click('Hide key');await click('Resume');await p.getByLabel('Page size').selectOption('Letter');await p.getByLabel('Skills',{exact:true}).check();await click('Safety');await click('Privacy');
 await anchor('Resumes');await click('Save master resume');await click('Use for new application');await click('Check my fit');await p.getByRole('status').filter({hasText:'20 characters'}).waitFor();
 await p.getByLabel('Role and company (optional)').fill('Data engineer at Atlas');await p.getByLabel('Job description').fill('Build Python data pipelines.\nWrite SQL reports.\nKubernetes administration required.');
 await click('Check my fit');await p.getByRole('heading',{name:'Keyword coverage'}).waitFor();await click('Prepare draft');
 await p.getByText('Edit included bullets',{exact:true}).click();await click('Save edits');
 await p.getByText('Prepare cover letter',{exact:true}).click();await p.getByLabel('Career evidence').selectOption({index:1});await click('Prepare letter');await p.getByText('Dear hiring team,',{exact:false}).waitFor();
 await anchor('Review approval');assert.equal(await btn('Download resume').count(),0);
 await click('Approve resume');await Promise.race([p.getByRole('heading',{name:'Approved for export'}).waitFor(),p.getByRole('status').filter({hasText:/failed|error|undefined|not a function|Cannot|Missing/i}).waitFor().then(async()=>{throw Error(await p.getByRole('status').innerText())})]);
 for(const format of ['txt','tex','pdf','docx']){await p.getByLabel('File format').selectOption(format);const [download]=await Promise.all([p.waitForEvent('download'),click('Download resume')]);assert(download.suggestedFilename().endsWith('.'+format));const bytes=await readFile(await download.path());assert(bytes.length>10);if(['docx','pdf'].includes(format)){const tab=await browser.newPage();await tab.goto(url+'/#/resumes');await tab.getByLabel('Upload your CV').setInputFiles({name:'roundtrip.'+format,mimeType:'application/octet-stream',buffer:bytes});await tab.waitForFunction(()=>document.querySelector('textarea')?.value.includes('Casey Doe'));await tab.close()}}
 await p.getByLabel('Application status').selectOption('Sent');await p.reload();assert.equal(await p.getByLabel('Application status').inputValue(),'Sent');await route('applications');await click('Sent · 1');await p.locator('.record').click();await p.waitForURL('**/export');console.log('PASS public navigation, onboarding, master resume, 4 templates, settings, validation, fit, tailoring, approval, 4 downloads, PDF/DOCX round trips, tracking and reload');
 await route('discover');await p.route('**/api/discovery/search',r=>r.fulfill({json:{jobs:[{id:'sample',title:'Analyst',company:'Fixture',description:'Write SQL reports and test pipelines.'}]}}));await click('Search jobs');await click('Use this job');assert((await p.getByLabel('Job description').inputValue()).includes('SQL'));
 await route('discover');await p.route('**/api/discovery/jobs',r=>r.fulfill({json:[]}));await click('Load saved jobs');await p.getByText('No jobs found.',{exact:false}).waitFor();
 await route('resumes');await p.route('**/api/profile/profiles',r=>r.fulfill({json:[{id:'sample',full_name:'Archived CV',source_resume_text:cv}]}));await p.getByText('Import an earlier AnyJob profile').click();await click('Find local profiles');await click('Archived CV');assert.equal(await p.getByLabel('Review your career history').inputValue(),cv);
 console.log('PASS cover letter, edit, discovery selection and legacy import UI using synthetic API fixtures');
 for(const width of [320,768,1024,1280]){await p.setViewportSize({width,height:820});for(const s of ['welcome','how','privacy','home','new','applications','resumes','templates','settings','discover','unknown']){await route(s);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' overflow on '+s)}}
 await p.setViewportSize({width:320,height:720});await route('home');await click('More');await p.getByRole('dialog').getByRole('link',{name:'Templates'}).click();await p.waitForURL('**/#/templates');await click('More');await p.keyboard.press('Escape');assert.equal(await p.getByRole('dialog').count(),0);assert.deepEqual(errors,[]);console.log('PASS all navigation widths, missing route, mobile sheet and Escape; no browser exceptions');
}finally{await browser.close();server.close()}

