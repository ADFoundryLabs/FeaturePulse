# FeaturePulse – Pull Request Intent Policy

## Purpose
This document defines the **intended purpose and acceptable behavior of pull requests**
for this repository. FeaturePulse uses this file as the **source of truth** when
evaluating whether a pull request aligns with project goals.

---

## What Is “Intent”?
Intent describes **why a change exists**, not just what it changes.

FeaturePulse infers intent from:
- Pull request title
- Pull request description
- Commit context
- Files modified

---

## Supported Intent Categories

### 1. Documentation Update
Changes that improve or modify:
- README files
- Markdown documentation
- Code comments

**Risk Level:** Low  
**Default Decision:** APPROVE

---

### 2. Bug Fix
Changes that correct:
- Broken functionality
- Incorrect logic
- Runtime errors

**Risk Level:** Medium  
**Default Decision:** APPROVE  
**Note:** Must not introduce unrelated changes.

---

### 3. New Feature
Changes that introduce:
- New functionality
- New modules or endpoints
- New user-facing behavior

**Risk Level:** High  
**Default Decision:** WARN  
**Note:** Should include clear description and intent.

---

### 4. Refactor
Changes that:
- Improve code structure
- Improve readability or maintainability
- Do not change behavior

**Risk Level:** Medium  
**Default Decision:** APPROVE

---

### 5. Test Improvement
Changes that:
- Add tests
- Improve test coverage
- Fix failing tests

**Risk Level:** Low  
**Default Decision:** APPROVE

---

### 6. General Improvement
Minor changes that do not fit other categories.

**Risk Level:** Low  
**Default Decision:** APPROVE

---

## Branch-Specific Rules

### Master Branch
Pull requests targeting `master` must:
- Clearly match one of the supported intent categories
- Avoid experimental or unfinished features
- Align with production stability

FeaturePulse applies **stricter evaluation** for `master` merges.

---

## How FeaturePulse Uses This File

FeaturePulse:
1. Reads this `intent.md` file
2. Compares PR details against defined intent rules
3. Uses AI reasoning to determine:
   - Detected intent
   - Risk level
   - Merge decision (APPROVE / WARN / BLOCK)
4. Posts results as:
   - A GitHub Check
   - A pull request comment

---

## Example Output

