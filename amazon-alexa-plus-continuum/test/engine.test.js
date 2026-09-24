const test = require('node:test');
const assert = require('node:assert/strict');
const { ContinuumEngine } = require('../src/engine');
const { handleRpc } = require('../src/server');

test('memory is captured and recalled',()=>{
  const e = new ContinuumEngine();
  e.captureMemory({text:'Oatmeal eggs and fruit for breakfast',tags:['food']});
  const r = e.recallContext({query:'breakfast fruit'});
  assert.equal(r[0].score,2);
});

test('irreversible workflow fails closed without approval',()=>{
  const e = new ContinuumEngine();
  const wf = e.proposeWorkflow({goal:'Book dinner and send everyone the details'});
  const r = e.executeWorkflow({workflowId:wf.id});
  assert.equal(r.workflow.status,'blocked');
  assert.ok(r.results.some(x=>x.status==='blocked'));
});

test('approved gated action can complete',()=>{
  const e = new ContinuumEngine();
  const wf = e.proposeWorkflow({goal:'Buy groceries for breakfast'});
  const gated = wf.steps.find(x=>x.requiresApproval);
  e.approveAction({workflowId:wf.id,stepId:gated.id,approved:true});
  const r = e.executeWorkflow({workflowId:wf.id});
  assert.equal(r.workflow.status,'completed');
});

test('MCP initialize advertises required protocol version',()=>{
  const r = handleRpc({jsonrpc:'2.0',id:1,method:'initialize',params:{}});
  assert.equal(r.result.protocolVersion,'2025-11-25');
});

test('MCP exposes six tools',()=>{
  const r = handleRpc({jsonrpc:'2.0',id:1,method:'tools/list'});
  assert.equal(r.result.tools.length,6);
});
