// ── API config ────────────────────────────────────────────────────────
const API_KEY  = "sk-jwVMOs8ac7gNmnBkB57e670f6cBd49B7A126713bF451451b";
const API_BASE = "http://10.161.112.104:3000/v1";

// ── Model definitions ─────────────────────────────────────────────────
// stream:    true  → streamed token-by-token (SSE from LLM server)
// reasoning: "think_tags"        → DeepSeek <think>…</think> blocks
//            "reasoning_content" → GPT-OSS reasoning_content field
const MODELS = {
  deepseek: { label: "DeepSeek R1",   model_name: "DeepSeek-r1-0528-fp16-671b", stream: true,  reasoning: "think_tags" },
  gptoss:   { label: "GPT-OSS 120B",  model_name: "gpt-oss-120b",               stream: false, reasoning: "reasoning_content" },
  gpt5mini: { label: "GPT-5 Mini",    model_name: "gpt-5-mini",                 stream: true,  reasoning: "think_tags", use_completion_tokens: true, no_temperature: true },
};

const MODEL_META = {
  deepseek: { icon: "&#x1F9E0;", meta: "Streaming &middot; Think-chain reasoning" },
  gptoss:   { icon: "&#x2728;",  meta: "High quality &middot; Reasoning content" },
  gpt5mini: { icon: "&#x26A1;",  meta: "Fast &middot; Lightweight streaming" },
};

// ── Role definitions ──────────────────────────────────────────────────
const ROLES = {
  general: {
    label:  "General",
    icon:   "&#x1F916;",
    desc:   "Helpful general-purpose AI assistant",
    system: "You are Aion, a helpful AI assistant. Your name is Aion. Always introduce yourself as Aion when asked who you are.",
    suggestions: [
      { title: "Explain a concept", text: "Explain how garbage collection works in modern programming languages." },
      { title: "Write code",        text: "Write a Python function that finds all prime numbers up to n using the Sieve of Eratosthenes." },
      { title: "Summarize text",    text: "Summarize the following text in 3 bullet points:\n[paste your text here]" },
      { title: "Debug help",        text: "Help me debug this issue:\n[describe your problem and paste relevant code]" },
    ],
  },
  automotive: {
    label:  "Embedded Automotive",
    icon:   "&#x1F697;",
    desc:   "Expert in MISRA-C, ISO 26262, AUTOSAR, TriCore",
    system: "You are Aion, an AI assistant specialized in embedded automotive software development. Your name is Aion. Always introduce yourself as Aion when asked who you are. You are knowledgeable about MISRA-C, ISO 26262, AUTOSAR, TriCore MCUs, CppUTest, and related automotive software topics.",
    suggestions: [
      { title: "Generate C code",  text: "Write a C function implementing a software debounce filter for a digital input pin (TriCore TC39x)." },
      { title: "MISRA-C review",   text: "Find MISRA-C:2012 violations in:\nvoid process(int *buf, int n) { for(int i=0;i<=n;i++) buf[i]=0; }" },
      { title: "ISO 26262 ASIL",   text: "Explain the difference between ASIL-B and ASIL-D in ISO 26262 and what extra measures ASIL-D requires." },
      { title: "Write unit tests", text: "Generate CppUTest unit tests for:\nuint16_t calc_checksum(const uint8_t *data, uint16_t len);" },
    ],
  },
  security: {
    label:  "Cybersecurity",
    icon:   "&#x1F512;",
    desc:   "Secure coding, OWASP, threat modeling",
    system: "You are Aion, an AI assistant specialized in secure software development and cybersecurity defense. Your name is Aion. Always introduce yourself as Aion when asked who you are. You are knowledgeable about OWASP Top 10, secure coding practices, threat modeling (STRIDE), vulnerability analysis, and defense-in-depth strategies. You help developers write safer code and understand security risks.",
    suggestions: [
      { title: "Review for vulns",  text: "Review this code for security vulnerabilities and suggest fixes:\n[paste code here]" },
      { title: "OWASP Top 10",     text: "Explain SQL injection (OWASP A03:2021) and show a secure parameterized query example in Python." },
      { title: "Threat model",     text: "Help me create a STRIDE threat model for a REST API that handles user authentication and personal data." },
      { title: "Secure practices", text: "What are the top 5 secure coding practices every developer should follow to prevent common vulnerabilities?" },
    ],
  },
};
