from __future__ import annotations

import json
from pathlib import Path

from .registry import CapabilityRegistry
from .types import CapabilityManifest, RiskTier


def load_manifest(path: str | Path) -> CapabilityManifest:
    raw = json.loads(Path(path).read_text())
    return CapabilityManifest(
        name=raw["name"],
        description=raw["description"],
        tags=tuple(raw.get("tags", [])),
        risk=RiskTier[raw.get("risk", "LOW")],
        requires=tuple(raw.get("requires", [])),
        permissions=tuple(raw.get("permissions", [])),
        domains=tuple(raw.get("domains", [])),
        provider=raw.get("provider", "local"),
        learnable=bool(raw.get("learnable", True)),
    )


def demo_registry() -> CapabilityRegistry:
    registry = CapabilityRegistry()
    registry.register(
        CapabilityManifest(
            name="sense.local_event",
            description="Observe a structured local event supplied to the run",
            tags=("sensor", "observation"),
            risk=RiskTier.READ_ONLY,
        ),
        lambda state: state.get("event", {"status": "no-event"}),
    )
    registry.register(
        CapabilityManifest(
            name="analyze.event",
            description="Create a deterministic analysis record from an observed event",
            tags=("analysis", "reasoning"),
            requires=("sense.local_event",),
            risk=RiskTier.READ_ONLY,
        ),
        lambda state: {"analysis": state["sense.local_event"], "confidence": 1.0},
    )
    registry.register(
        CapabilityManifest(
            name="act.record_decision",
            description="Record a low-risk decision artifact",
            tags=("action", "audit"),
            requires=("analyze.event",),
            permissions=("write_artifact",),
            risk=RiskTier.LOW,
        ),
        lambda state: {"decision": "recorded", "basis": state["analyze.event"]},
    )
    return registry
