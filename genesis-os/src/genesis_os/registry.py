from __future__ import annotations

from collections.abc import Callable
from typing import Any

from .types import CapabilityManifest

CapabilityFn = Callable[[dict[str, Any]], Any]


class CapabilityRegistry:
    def __init__(self) -> None:
        self._manifests: dict[str, CapabilityManifest] = {}
        self._handlers: dict[str, CapabilityFn] = {}

    def register(self, manifest: CapabilityManifest, handler: CapabilityFn) -> None:
        if manifest.name in self._manifests:
            raise ValueError(f"capability already registered: {manifest.name}")
        self._manifests[manifest.name] = manifest
        self._handlers[manifest.name] = handler

    def manifest(self, name: str) -> CapabilityManifest:
        try:
            return self._manifests[name]
        except KeyError as exc:
            raise KeyError(f"unknown capability: {name}") from exc

    def handler(self, name: str) -> CapabilityFn:
        self.manifest(name)
        return self._handlers[name]

    def names(self) -> tuple[str, ...]:
        return tuple(sorted(self._manifests))

    def discover(self, query: str, *, domain: str | None = None) -> list[CapabilityManifest]:
        tokens = {t.lower() for t in query.replace(".", " ").replace("-", " ").split()}
        scored: list[tuple[int, CapabilityManifest]] = []
        for manifest in self._manifests.values():
            if domain and manifest.domains and domain not in manifest.domains:
                continue
            haystack = " ".join((manifest.name, manifest.description, *manifest.tags)).lower()
            score = sum(1 for token in tokens if token in haystack)
            if score:
                scored.append((score, manifest))
        return [m for _, m in sorted(scored, key=lambda item: (-item[0], item[1].name))]
