const fs = require('fs/promises');
const path = require('path');

const skillsDir = path.join(__dirname, 'skills');
const threadsDir = path.join(__dirname, 'threads');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadJsonFiles = async (dir) => {
  const entries = await fs.readdir(dir);
  const jsonEntries = [];
  for (const entry of entries) {
    if (!entry.toLowerCase().endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(dir, entry), 'utf8');
    jsonEntries.push(JSON.parse(raw));
  }
  return jsonEntries;
};

const runSkill = async (skill, threadName) => {
  const durationMs = skill.durationMs || 300;
  console.log(`[${threadName}] skill ${skill.name} started (${durationMs}ms)`);
  const start = Date.now();
  await sleep(durationMs);
  const elapsed = Date.now() - start;
  console.log(`[${threadName}] skill ${skill.name} finished (${elapsed}ms)`);
  return { skill: skill.name, description: skill.description, elapsedMs: elapsed };
};

const runThread = async (thread, skillMap) => {
  console.log(`[${thread.name}] thread launched: ${thread.description || 'no description'}`);
  const results = [];
  for (const skillName of thread.skills || []) {
    const skill = skillMap.get(skillName);
    if (!skill) {
      throw new Error(`Thread ${thread.name} refers to unknown skill ${skillName}`);
    }
    results.push(await runSkill(skill, thread.name));
  }
  console.log(`[${thread.name}] thread completed (${results.length} skills)`);
  return { thread: thread.name, description: thread.description, steps: results };
};

const main = async () => {
  const [skills, threads] = await Promise.all([
    loadJsonFiles(skillsDir),
    loadJsonFiles(threadsDir),
  ]);

  const skillMap = new Map();
  for (const skill of skills) {
    if (!skill.name) {
      throw new Error(`Skill file missing name property: ${JSON.stringify(skill)}`);
    }
    skillMap.set(skill.name, skill);
  }
  if (!threads.length) {
    console.log('No threads defined. Copy or add files into threads/ to see concurrent execution.');
    return;
  }

  const threadPromises = threads.map((thread) => runThread(thread, skillMap));
  const results = await Promise.all(threadPromises);

  console.log('\n=== Parallel execution summary ===');
  for (const result of results) {
    console.log(`* ${result.thread}: ${result.steps.length} skills, last step ${result.steps.length ? result.steps[result.steps.length - 1].skill : 'none'}`);
  }
  console.log('==================================');
};

main().catch((error) => {
  console.error('Runner error:', error);
  process.exitCode = 1;
});
