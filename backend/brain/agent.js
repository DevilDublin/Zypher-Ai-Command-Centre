export async function agentReply(conversation) {
  const lastUser = conversation
    .filter(m => m.role === "user")
    .at(-1)?.content || "";

  return `Zypher agent responding to: "${lastUser}"`;
}
