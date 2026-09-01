from __future__ import annotations

import argparse
import json

from .catalog import demo_registry
from .runtime import GenesisRuntime
from .types import ExecutionContext, Goal


def main() -> None:
    parser = argparse.ArgumentParser(prog="genesis", description="Genesis OS reference runtime")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("capabilities")
    demo = sub.add_parser("demo")
    demo.add_argument("--event", default='{"kind":"market-shift","severity":2}')
    args = parser.parse_args()

    registry = demo_registry()
    if args.command == "capabilities":
        print("\n".join(registry.names()))
        return

    runtime = GenesisRuntime(registry)
    goal = Goal(
        objective="Observe, analyze, and record a low-risk event",
        required_capabilities=("act.record_decision",),
        metadata={"event": json.loads(args.event)},
    )
    result = runtime.run(goal, ExecutionContext(approved_permissions={"write_artifact"}))
    print(json.dumps({
        "run_id": result.run_id,
        "success": result.success,
        "steps": [s.__dict__ for s in result.steps],
    }, indent=2, default=str))


if __name__ == "__main__":
    main()
