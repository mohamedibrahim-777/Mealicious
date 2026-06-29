#!/usr/bin/env bun
// PreToolUse security guard. Reads hook payload JSON on stdin.
// Exit 2 = block the tool call (stderr shown to the agent). Exit 0 = allow.

const DANGEROUS = [
  { re: /\brm\s+-rf?\b.*(\/(\s|$)|\*|~|\.\.)/, why: "recursive force delete of broad path" },
  { re: /\b(curl|wget)\b[^|]*\|\s*(sh|bash|zsh)\b/, why: "pipe remote script straight to shell" },
  { re: /\bsudo\b/, why: "privilege escalation" },
  { re: /\bchmod\s+777\b/, why: "world-writable permissions" },
  { re: /\bssh\b\s+\S+/, why: "outbound ssh from agent" },
  { re: />\s*\/dev\/(?!null\b)/, why: "write to device file" },
  { re: />\s*\.env\b/, why: "overwrite .env secrets" },
  { re: /\bgit\s+push\b.*--force\b|\bgit\s+push\s+-f\b/, why: "force push" },
  { re: /\bchattr\s+-i\b/, why: "unlock immutable (locked VPS files)" },
  { re: /\bpm2\s+(stop|delete|kill)\b/, why: "stop locked pm2 process" },
  { re: /docker\s+(stop|rm|kill)\s+.*mealicious-db/, why: "touch live database container" },
];

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    process.exit(0); // can't parse — don't block legit work
  }
  const cmd = payload?.tool_input?.command;
  if (typeof cmd !== "string") process.exit(0);

  for (const { re, why } of DANGEROUS) {
    if (re.test(cmd)) {
      process.stderr.write(`BLOCKED by pretool-guard: ${why}\n  command: ${cmd}\n`);
      process.exit(2);
    }
  }
  process.exit(0);
});
