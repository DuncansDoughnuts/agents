from __future__ import annotations

from dataclasses import dataclass, field
from enum import IntEnum
from typing import Any


class RiskTier(IntEnum):
    READ_ONLY = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


@dataclass(frozen=True)
class CapabilityManifest:
    name: str
    description: str
    tags: tuple[str, ...] = ()
    risk: RiskTier = RiskTier.LOW
    requires: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()
    domains: tuple[str, ...] = ()
    provider: str = "local"
    learnable: bool = True


@dataclass
class Goal:
    objective: str
    required_capabilities: tuple[str, ...]
    domain: str = "general"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ExecutionContext:
    actor: str = "operator"
    approved_permissions: set[str] = field(default_factory=set)
    owned_assets: set[str] = field(default_factory=set)
    allow_live_finance: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class StepResult:
    capability: str
    success: bool
    output: Any = None
    error: str | None = None
    score: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class RunResult:
    goal: Goal
    success: bool
    steps: list[StepResult]
    run_id: str
