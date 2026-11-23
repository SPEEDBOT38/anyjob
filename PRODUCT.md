# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People actively seeking a new role who want to avoid repeating the same job-search and resume-customization work for every application.

## Product Purpose

AnyJob turns one confirmed career profile and job-search preferences into a continuously useful workspace: discover suitable jobs, explain fit and gaps, prepare truthful tailored materials, and track actual applications.

## Positioning

One verified career profile powers the whole application lifecycle. AnyJob distinguishes eligibility from relevance and never presents unsupported qualifications as facts.

## Operating Context

Users begin with a resume upload or a small amount of profile information, review extracted facts, choose target roles and locations, then work through a curated job inbox. Each selected job has a saved source snapshot, fit rationale, resume versions and an application state.

## Capabilities and Constraints

- Job discovery uses approved sources and JobSpy where supported.
- A user must approve profile facts and generated material before an application is marked submitted.
- Discovery, preparation and submission are separate autonomy levels; the initial product stops at preparing a review-ready application packet.
- Tailoring must use verified evidence only and surface gaps for confirmation.
- The existing project is a static HTML SPA backed by FastAPI JSON services.

## Brand Commitments

Name: AnyJob. The product should feel calm, candid and practical rather than promising ATS certainty or hidden automation.

## Evidence on Hand

- Existing FastAPI services under `api/` for profiles, discovery, matching, tailoring, rendering and packets.
- Existing resume template assets under `public/assets/templates/`.
- No validated user testimonials, hiring outcomes or ATS-performance claims are available; the interface must not invent them.

## Product Principles

1. Start useful, then ask for detail only when it improves a decision.
2. Make every job explainable and actionable.
3. Show evidence, uncertainty and user control rather than fabricated confidence.
4. Keep one job, its documents and its real status together.
5. Never confuse prepared material with a submitted application.

## Accessibility & Inclusion

Keyboard-operable controls, clear status text, responsive layouts, strong contrast, and no reliance on color alone for important state.
