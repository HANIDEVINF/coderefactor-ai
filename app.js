const codeInput = document.getElementById("codeInput");
const languageSelect = document.getElementById("language");
const issuesList = document.getElementById("issues");
const scoreText = document.getElementById("score");
const refactoredCode = document.getElementById("refactoredCode");
const statusMessage = document.getElementById("statusMessage");

const analyzeBtn = document.getElementById("analyzeBtn");
const refactorBtn = document.getElementById("refactorBtn");
const saveBtn = document.getElementById("saveBtn");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");

const SUPABASE_URL = "https://fmmlcroghjmjfmcvnsas.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Cy7FajipWWkr9b7vzhV_aw_nlfV44zs";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const sessionId = (() => {
  const existing = localStorage.getItem("coderefactor_session_id");
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem("coderefactor_session_id", created);
  return created;
})();

function analyzeCode(code, language) {
  const issues = [];
  let score = 100;

  if (!code.trim()) {
    return { issues: ["Code input is empty."], score: 0 };
  }

  if (code.includes("var ")) {
    issues.push("Avoid using 'var'; use 'let' or 'const'.");
    score -= 12;
  }

  if (code.includes("==") && !code.includes("===")) {
    issues.push("Prefer strict equality (===) over loose equality (==).");
    score -= 10;
  }

  if (code.length > 800 && !code.includes("\n\n")) {
    issues.push("Code appears dense; split logic into smaller blocks/functions.");
    score -= 8;
  }

  if (language === "javascript") {
    if (/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{260,}\}/m.test(code)) {
      issues.push("Large function detected; consider splitting responsibilities.");
      score -= 14;
    }
    if (code.includes("console.log(")) {
      issues.push("Remove or guard debug console logs before production.");
      score -= 7;
    }
  }

  if (language === "python") {
    if (code.includes("print(")) {
      issues.push("Avoid raw print debugging; prefer logging.");
      score -= 7;
    }
    if (/except\s*:\s*\n/m.test(code)) {
      issues.push("Avoid bare except; catch specific exception types.");
      score -= 13;
    }
    if (/\bdef\s+\w+\([^)]*\):\n(?:    .+\n){25,}/m.test(code)) {
      issues.push("Long Python function found; extract smaller helper functions.");
      score -= 14;
    }
  }

  if (issues.length === 0) {
    issues.push("No obvious issues found in quick static analysis.");
  }

  return { issues, score: Math.max(score, 0) };
}

function autoRefactor(code, language) {
  let output = code;

  if (language === "javascript") {
    output = output.replace(/\bvar\b/g, "let");
    output = output.replace(/([^=!<>])==([^=])/g, "$1===$2");
    output = output.replace(/console\.log\(/g, "/* debug */ console.log(");
  }

  if (language === "python") {
    output = output.replace(/\t/g, "    ");
    output = output.replace(/except\s*:\s*\n/g, "except Exception as err:\n");
    output = output.replace(/print\(/g, "logging.info(");
  }

  return output;
}

function renderAnalysis(result) {
  scoreText.textContent = `Quality score: ${result.score} / 100`;
  issuesList.innerHTML = "";
  result.issues.forEach((issue) => {
    const li = document.createElement("li");
    li.textContent = issue;
    issuesList.appendChild(li);
  });
}

function loadSample() {
  if (languageSelect.value === "javascript") {
    codeInput.value = `var total = 0;
function calculate(items) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].price == 10) {
      console.log("matched");
      total = total + items[i].price;
    }
  }
  return total;
}`;
  } else {
    codeInput.value = `def process_data(items):
    total = 0
    for item in items:
        try:
            if item["price"] == 10:
                print("matched")
                total += item["price"]
        except:
            pass
    return total`;
  }
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "#2f3a52";
}

async function saveReview() {
  const code = codeInput.value.trim();
  const language = languageSelect.value;
  const refactored = refactoredCode.textContent;
  const analysis = analyzeCode(code, language);

  if (!code) {
    setStatus("Please add code first, then click Save Review.", true);
    return;
  }

  setStatus("Saving review to cloud...");

  const payload = {
    session_id: sessionId,
    language,
    input_code: code,
    issues: analysis.issues,
    score: analysis.score,
    refactored_code: refactored === "No refactor yet." ? null : refactored
  };

  const { error } = await supabaseClient.from("reviews").insert(payload);
  if (error) {
    setStatus(`Save failed: ${error.message}`, true);
    return;
  }

  setStatus("Saved successfully. Users can now test and generate data live.");
}

analyzeBtn.addEventListener("click", () => {
  const result = analyzeCode(codeInput.value, languageSelect.value);
  renderAnalysis(result);
});

refactorBtn.addEventListener("click", () => {
  const code = codeInput.value;
  if (!code.trim()) {
    refactoredCode.textContent = "No code to refactor.";
    return;
  }
  refactoredCode.textContent = autoRefactor(code, languageSelect.value);
});

sampleBtn.addEventListener("click", loadSample);
saveBtn.addEventListener("click", saveReview);

clearBtn.addEventListener("click", () => {
  codeInput.value = "";
  issuesList.innerHTML = "";
  scoreText.textContent = "Quality score: -- / 100";
  refactoredCode.textContent = "No refactor yet.";
  setStatus("");
});
