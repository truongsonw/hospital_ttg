# HospitalTTG Codex Agent Files

Copy this package into the root of the `hospital_ttg` repository.

Included files:

- `AGENTS.md`: repository-wide Codex instructions.
- Nested `AGENTS.md` files under backend and frontend directories.
- `.codex/config.toml`: conservative subagent settings.
- `.codex/agents/*.toml`: custom Codex subagents for HospitalTTG.

Recommended install from the repository root:

```bash
cp -R /path/to/hospitalttg-codex-agents/. .
```

Then verify Codex sees the instructions:

```bash
codex --ask-for-approval never "Summarize the current instructions and list custom agents."
```

Operational notes:

- Keep `agents.max_depth = 1` unless you really want recursive delegation.
- Use read-only agents for exploration, security review, contract review, and final review.
- Use write-capable agents only for scoped implementation tasks.
- Do not let two agents edit the same file at the same time.
