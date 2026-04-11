const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const diagnostics = [
  {
    matcher: "Cannot read properties of undefined (reading 'items')",
    badLine: "const items = props.user.orders.items;",
    rootCause:
      "The component assumes `props.user.orders` exists before ensuring `props.user` is populated, so `orders` is undefined at render time.",
    fixSuggestion:
      "Guard against missing data paths and render a loader or empty state until `user.orders` is defined.",
    patchPreview: `--- src/components/Dashboard.jsx
+++ src/components/Dashboard.jsx
@@
-const items = props.user.orders.items;
+const items = props.user?.orders?.items ?? [];
`
  },
  {
    matcher: "Mutable values like 'countRef.current'",
    badLine: "useEffect(() => {\n-  report(countRef.current);\n+  report(countRef.current);",
    rootCause:
      "A mutable ref is being read inside a hook without solidifying dependencies, so the hook keeps re-running when React reconciles.",
    fixSuggestion:
      "Capture the ref value in a stable variable or add the value to the dependency array to stop the warning.",
    patchPreview: `--- src/hooks/useCounter.ts
+++ src/hooks/useCounter.ts
@@
-  useEffect(() => {
-    report(countRef.current);
-  });
+  useEffect(() => {
+    const currentCount = countRef.current;
+    report(currentCount);
+  }, []);
`
  }
];

function analyzeStackTrace(trace) {
  const normalizedTrace = trace ?? "";
  return (
    diagnostics.find((entry) => normalizedTrace.includes(entry.matcher)) || {
      badLine: "Unable to locate the bad line",
      rootCause:
        "Codex could not parse the supplied stack trace. Confirm the stack trace includes file names and line numbers.",
      fixSuggestion:
        "Re-run the scenario locally, copy the console stack trace, and resend it once it includes the throw site.",
      patchPreview: "No patch available."
    }
  );
}

app.post("/stack-trace", (req, res) => {
  const { stackTrace } = req.body || {};
  const payload = analyzeStackTrace(stackTrace);
  return res.json(payload);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Stack trace diagnostics listening on port ${PORT}`);
});
