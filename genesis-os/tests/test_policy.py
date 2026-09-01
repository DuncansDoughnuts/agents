from genesis_os.policy import PolicyEngine
from genesis_os.types import CapabilityManifest, ExecutionContext, RiskTier


def test_permission_gate():
    manifest = CapabilityManifest(name="write", description="write", permissions=("write",))
    assert not PolicyEngine().authorize(manifest, ExecutionContext()).allowed
    assert PolicyEngine().authorize(manifest, ExecutionContext(approved_permissions={"write"})).allowed


def test_defensive_security_requires_owned_scope():
    manifest = CapabilityManifest(name="scan", description="scan", tags=("defensive-security",), risk=RiskTier.MEDIUM)
    assert not PolicyEngine().authorize(manifest, ExecutionContext()).allowed
    assert PolicyEngine().authorize(manifest, ExecutionContext(owned_assets={"example.test"})).allowed


def test_live_trading_off_by_default():
    manifest = CapabilityManifest(name="trade", description="trade", tags=("live-trading",), risk=RiskTier.MEDIUM)
    assert not PolicyEngine().authorize(manifest, ExecutionContext()).allowed
