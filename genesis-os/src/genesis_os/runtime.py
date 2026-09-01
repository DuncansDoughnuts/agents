from __future__ import annotations

import uuid

from .evaluator import Evaluator
from .memory import MemoryStore
from .planner import Planner
from .policy import PolicyEngine
from .registry import CapabilityRegistry
from .types import ExecutionContext, Goal, RunResult, StepResult


class GenesisRuntime:
    def __init__(
        self,
        registry: CapabilityRegistry,
        *,
        memory: MemoryStore | None = None,
        policy: PolicyEngine | None = None,
        evaluator: Evaluator | None = None,
    ) -> None:
        self.registry = registry
        self.memory = memory or MemoryStore()
        self.policy = policy or PolicyEngine()
        self.evaluator = evaluator or Evaluator()
        self.planner = Planner(registry)

    def run(self, goal: Goal, context: ExecutionContext | None = None) -> RunResult:
        context = context or ExecutionContext()
        run_id = str(uuid.uuid4())
        plan = self.planner.build(goal)
        state = dict(goal.metadata)
        results: list[StepResult] = []

        for capability in plan.steps:
            manifest = self.registry.manifest(capability)
            decision = self.policy.authorize(manifest, context)
            if not decision.allowed:
                result = StepResult(
                    capability=capability,
                    success=False,
                    error=decision.reason,
                    score=0.0,
                )
                results.append(result)
                self.memory.remember_episode(
                    run_id,
                    capability,
                    False,
                    0.0,
                    {"error": decision.reason},
                )
                return RunResult(goal=goal, success=False, steps=results, run_id=run_id)

            try:
                output = self.registry.handler(capability)(state)
                state[capability] = output
                result = StepResult(capability=capability, success=True, output=output)
            except Exception as exc:  # boundary: adapters may fail unpredictably
                result = StepResult(capability=capability, success=False, error=str(exc))

            result.score = self.evaluator.score(result)
            results.append(result)
            self.memory.remember_episode(
                run_id,
                capability,
                result.success,
                result.score,
                {"output": result.output, "error": result.error},
            )
            if not result.success:
                return RunResult(goal=goal, success=False, steps=results, run_id=run_id)

        signature = f"{goal.domain}:{'|'.join(plan.steps)}"
        self.memory.record_procedure_success(signature, list(plan.steps))
        return RunResult(goal=goal, success=True, steps=results, run_id=run_id)
