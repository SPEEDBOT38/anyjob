// Scraped job posts often arrive with their line breaks and list markup stripped:
// "Key Responsibilities1. Data Understanding & InterpretationUnderstand goals.Analyse data.Translate..."
// This puts the structure back: headings on their own line, glued sentences as bullets, numbered sub-headings.
const HEADINGS = ['Preferred Qualifications', 'Minimum Qualifications', 'Key Responsibilities', 'Responsibilities', 'Requirements', 'Qualifications', 'What We Are Looking For', 'What We\'re Looking For', 'What You Will Do', 'What You\'ll Do', 'What You Will Bring', 'What You Bring', 'The Person We Want', 'Who You Are', 'About the Role', 'About the Company', 'About the Team', 'About Us', 'Company Description', 'Job Description', 'Role Overview', 'Position Summary', 'Nice to Have', 'Good to Have', 'What We Offer', 'Benefits', 'Perks', 'Skills', 'Experience'];
const HEAD_ALT = HEADINGS.map(h => h.replace(/'/g, "['’]")).join('|');
const GLUED_HEAD = new RegExp('[ \\t]*(' + HEAD_ALT + ')(?=[A-Z0-9])', 'g');
const LINE_HEAD = new RegExp('^(?:' + HEAD_ALT + ')\\s*:?$', 'i');
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;

const isBullet = l => /^[-•·▪●◦*]\s+\S/.test(l);

export function tidyJob(input) {
  let t = String(input || '').replace(/\r/g, '').replace(/ /g, ' ');
  // emoji used as decoration at line starts, and emoji glued to the previous sentence
  t = t.replace(/([.!?:)])(?=[\u{1F300}-\u{1FAFF}])/gu, '$1\n');
  t = t.split('\n').map(l => l.replace(new RegExp('^[\\s]*(?:[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{FE0F}]\\s*)+', 'u'), '')).join('\n');
  // a lone "-" on its own line (Arbeitnow style) belongs to the next line
  t = t.replace(/^[-•]\s*\n+(?=\S)/gm, '- ');
  // headings glued to the text that follows them
  t = t.replace(GLUED_HEAD, '\n\n$1\n');
  // sentences glued together with no space were list items: put each on its own bullet
  t = t.replace(/(?<=[a-z\)%\]])[.;](?=[A-Z][a-z])/g, m => m + '\n- ');
  t = t.replace(/(?<=[a-z\)])[!?](?=[A-Z])/g, m => m + '\n');
  t = t.replace(/(?<=[.!?])(?=\d{1,2}\.\s+[A-Z])/g, '\n');
  // "Label: value" pairs glued together
  t = t.replace(/(?<=[a-z]{3}|\))((?:[A-Z][a-z]+ ){0,2}[A-Z][a-z]+:)(?=\s)/g, '\n$1');
  let lines = t.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim());
  // numbered sub-headings ("1. Data Understanding & Interpretation") become headings, not bullets
  lines = lines.map(l => {
    const m = l.match(/^\d{1,2}[.)]\s+([A-Z][^.!?]{2,70})$/);
    return m && m[1].split(/\s+/).length <= 9 ? '### ' + m[1] : l;
  });
  // standalone known headings get a marker the parser understands
  lines = lines.map(l => (LINE_HEAD.test(l) ? '## ' + l.replace(/:$/, '') : l));
  // the first item of a flattened list is not preceded by a bullet: add it
  for (let i = 0; i < lines.length - 1; i++) {
    const l = lines[i], prev = i ? lines[i - 1] : '';
    if (l && !isBullet(l) && !/^#{2,3}\s/.test(l) && !/:$/.test(l) && l.length <= 400 && isBullet(lines[i + 1]) && (!prev || /^#{2,3}\s/.test(prev))) lines[i] = '- ' + l;
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
