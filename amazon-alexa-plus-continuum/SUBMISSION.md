# Devpost Submission Copy

## Title
Continuum — Alexa+ Mission Control

## Tagline
A personal operations agent that remembers context, orchestrates multi-step work, and refuses irreversible actions until you approve them.

## Inspiration
Voice assistants are great at single-turn questions, but real life is made of multi-step missions: plan the day, remember preferences, draft the follow-up, prepare a booking, and carry context into the next conversation. The hard part is not generating text; it is maintaining state and knowing when the assistant must stop and ask for permission.

## What it does
Continuum turns a spoken intent into a stateful workflow. It recalls user-owned context, decomposes the goal into steps, marks risk, completes safe steps, and blocks purchase/booking or irreversible external-write steps until the owner explicitly approves that exact step. It keeps an audit ledger so the user can see what happened and why.

## How we built it
A zero-dependency Node.js service exposes an MCP-style Streamable HTTP JSON-RPC endpoint using protocol version 2025-11-25 plus a web simulator for the Alexa+ experience. The workflow engine implements memory capture/retrieval, planning, approval state and fail-closed execution. A deterministic Node test suite checks the core safety and MCP behaviors.

## What makes it Alexa+ native
The track calls out context-aware state across sessions and autonomous orchestration as creative use cases. Continuum is deliberately not a single-turn Q&A bot or thin API wrapper. The product is the persistent mission state, approval boundary and auditability around orchestration.

## Product feedback
The alternate Alexa+ simulation path is valuable because the gated preview toolchain is not open to hackathon entrants. The biggest onboarding friction is that this limitation can be unclear until the FAQ. A small official MCP conformance harness for the required protocol version would also reduce uncertainty.

## What is next
Add real adapters for calendar, messaging and commerce behind the same approval policy; support cards/carousels for richer multimodal results; and add signed provenance so remembered context can inform an action without ever becoming authorization.

## Primary track
Alexa+

## Mini challenges
None in the current zero-spend build. AWS Builder can be added only if sponsor-provided credits and credentials are activated without out-of-pocket spend.
