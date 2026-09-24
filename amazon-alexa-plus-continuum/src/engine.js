const crypto = require('crypto');

function nowIso() { return new Date().toISOString(); }
function id(prefix='id') { return `${prefix}_${crypto.randomBytes(5).toString('hex')}`; }

class ContinuumEngine {
  constructor(seed = {}) {
    this.memories = Array.isArray(seed.memories) ? [...seed.memories] : [];
    this.workflows = Array.isArray(seed.workflows) ? [...seed.workflows] : [];
    this.audit = Array.isArray(seed.audit) ? [...seed.audit] : [];
  }

  captureMemory({ text, source='voice', tags=[] }) {
    if (!text || typeof text !== 'string') throw new Error('text is required');
    const memory = { id: id('mem'), text: text.trim(), source, tags, createdAt: nowIso() };
    this.memories.push(memory);
    this.audit.push({ at: nowIso(), type: 'memory.capture', memoryId: memory.id, source });
    return memory;
  }

  recallContext({ query='', limit=5 }) {
    const q = String(query).toLowerCase().split(/\s+/).filter(Boolean);
    const scored = this.memories.map(m => {
      const hay = `${m.text} ${(m.tags||[]).join(' ')}`.toLowerCase();
      const score = q.reduce((s,t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { ...m, score };
    }).sort((a,b) => b.score - a.score || String(b.createdAt).localeCompare(String(a.createdAt)));
    return scored.slice(0, Math.max(1, Math.min(20, limit)));
  }

  proposeWorkflow({ goal, context=[] }) {
    if (!goal || typeof goal !== 'string') throw new Error('goal is required');
    const lower = goal.toLowerCase();
    const steps = [];
    if (/meeting|schedule|calendar/.test(lower)) steps.push({ kind:'calendar.read', risk:'low', requiresApproval:false, label:'Check calendar constraints' });
    if (/email|message|send|contact/.test(lower)) steps.push({ kind:'message.draft', risk:'medium', requiresApproval:false, label:'Draft message' });
    if (/buy|purchase|pay|order|book/.test(lower)) steps.push({ kind:'commerce.prepare', risk:'high', requiresApproval:true, label:'Prepare purchase or booking' });
    if (/delete|cancel|publish|post/.test(lower)) steps.push({ kind:'external.write', risk:'high', requiresApproval:true, label:'Prepare irreversible external action' });
    if (!steps.length) steps.push({ kind:'plan', risk:'low', requiresApproval:false, label:'Create an actionable plan' });
    steps.push({ kind:'summary', risk:'low', requiresApproval:false, label:'Summarize outcome and unresolved decisions' });
    const workflow = { id:id('wf'), goal, context, status:'proposed', createdAt:nowIso(), steps:steps.map((s,i)=>({id:`s${i+1}`,...s,status:'pending'})) };
    this.workflows.push(workflow);
    this.audit.push({ at:nowIso(), type:'workflow.proposed', workflowId:workflow.id, goal });
    return workflow;
  }

  approveAction({ workflowId, stepId, approved=true }) {
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) throw new Error('workflow not found');
    const step = wf.steps.find(s => s.id === stepId);
    if (!step) throw new Error('step not found');
    step.approved = Boolean(approved);
    step.approvalAt = nowIso();
    this.audit.push({ at:nowIso(), type:'action.approval', workflowId, stepId, approved:Boolean(approved) });
    return step;
  }

  executeWorkflow({ workflowId }) {
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) throw new Error('workflow not found');
    const results = [];
    for (const step of wf.steps) {
      if (step.requiresApproval && step.approved !== true) {
        step.status = 'blocked';
        results.push({ stepId:step.id, status:'blocked', reason:'owner approval required' });
        continue;
      }
      step.status = 'completed';
      step.completedAt = nowIso();
      results.push({ stepId:step.id, status:'completed', output:this.simulate(step, wf) });
    }
    wf.status = results.some(r=>r.status==='blocked') ? 'blocked' : 'completed';
    wf.updatedAt = nowIso();
    this.audit.push({ at:nowIso(), type:'workflow.executed', workflowId, status:wf.status });
    return { workflow:wf, results };
  }

  simulate(step, wf) {
    switch(step.kind) {
      case 'calendar.read': return 'Calendar constraints checked in simulator; no external calendar mutation performed.';
      case 'message.draft': return `Draft prepared for goal: ${wf.goal}`;
      case 'commerce.prepare': return 'Purchase/booking prepared only; final commitment intentionally gated.';
      case 'external.write': return 'External write prepared only; final irreversible action intentionally gated.';
      case 'plan': return `Plan created for: ${wf.goal}`;
      default: return `Workflow summary produced for: ${wf.goal}`;
    }
  }

  snapshot() { return { memories:this.memories, workflows:this.workflows, audit:this.audit }; }
}

module.exports = { ContinuumEngine };
