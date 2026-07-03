# Pronunciation Noop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal pronunciation assessment provider boundary and Noop implementation for the MVP non-goal.

**Architecture:** Keep pronunciation assessment as a separate shared capability from text evaluation. The MVP provider returns a normal `unavailable` result instead of throwing or reporting a failed analysis.

**Tech Stack:** TypeScript, Jest.

---

## File Structure

- Create `src/shared/lib/pronunciation-assessment/types.ts` for the provider contract and result types.
- Create `src/shared/lib/pronunciation-assessment/NoopPronunciationAssessmentProvider.ts` for the MVP Noop provider.
- Create `src/shared/lib/pronunciation-assessment/index.ts` for public exports.
- Create `src/shared/lib/pronunciation-assessment/__tests__/NoopPronunciationAssessmentProvider.test.ts` for behavior coverage.

## Task 1: Provider Boundary And Noop

- [ ] Write a failing test proving Noop returns `status: "unavailable"` and `reason: "mvp_non_goal"`.
- [ ] Run the focused test and verify it fails because the module does not exist.
- [ ] Add the provider contract, Noop implementation, and exports.
- [ ] Run the focused test and verify it passes.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run lint`.
