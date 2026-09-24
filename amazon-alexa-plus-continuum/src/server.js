const http = require('http');
const fs = require('fs');
const path = require('path');
const { ContinuumEngine } = require('./engine');

const PORT = Number(process.env.PORT || 8787);
const engine = new ContinuumEngine({
  memories: [
    { id:'mem_seed_breakfast', text:'Breakfast preference: oatmeal, eggs, and fruit.', source:'demo', tags:['food','routine'], createdAt:new Date().toISOString() },
    { id:'mem_seed_focus', text:'Avoid committing money or irreversible external actions without explicit owner approval.', source:'policy', tags:['safety','approval'], createdAt:new Date().toISOString() }
  ]
});

const tools = [
  { name:'capture_memory', description:'Store a user-owned memory with source and tags.', inputSchema:{type:'object',properties:{text:{type:'string'},source:{type:'string'},tags:{type:'array',items:{type:'string'}}},required:['text']} },
  { name:'recall_context', description:'Retrieve relevant remembered context.', inputSchema:{type:'object',properties:{query:{type:'string'},limit:{type:'number'}}} },
  { name:'propose_workflow', description:'Create a stateful multi-step workflow with explicit risk gates.', inputSchema:{type:'object',properties:{goal:{type:'string'},context:{type:'array'}},required:['goal']} },
  { name:'approve_action', description:'Approve or reject one gated workflow step.', inputSchema:{type:'object',properties:{workflowId:{type:'string'},stepId:{type:'string'},approved:{type:'boolean'}},required:['workflowId','stepId']} },
  { name:'execute_workflow', description:'Execute safe/simulated steps; high-risk actions fail closed without approval.', inputSchema:{type:'object',properties:{workflowId:{type:'string'}},required:['workflowId']} },
  { name:'get_state', description:'Return current workflow, memory, and audit state.', inputSchema:{type:'object',properties:{}} }
];

function json(res, code, body) {
  res.writeHead(code, {'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*'});
  res.end(JSON.stringify(body));
}

function callTool(name,args={}) {
  switch(name) {
    case 'capture_memory': return engine.captureMemory(args);
    case 'recall_context': return engine.recallContext(args);
    case 'propose_workflow': return engine.proposeWorkflow(args);
    case 'approve_action': return engine.approveAction(args);
    case 'execute_workflow': return engine.executeWorkflow(args);
    case 'get_state': return engine.snapshot();
    default: throw new Error(`unknown tool: ${name}`);
  }
}

function handleRpc(msg) {
  const id = msg.id ?? null;
  if (msg.method === 'initialize') return {jsonrpc:'2.0',id,result:{protocolVersion:'2025-11-25',capabilities:{tools:{}},serverInfo:{name:'continuum-alexa-plus',version:'1.0.0'}}};
  if (msg.method === 'tools/list') return {jsonrpc:'2.0',id,result:{tools}};
  if (msg.method === 'tools/call') {
    const {name,arguments:args={}} = msg.params || {};
    const result = callTool(name,args);
    return {jsonrpc:'2.0',id,result:{content:[{type:'text',text:JSON.stringify(result,null,2)}],structuredContent:result}};
  }
  return {jsonrpc:'2.0',id,error:{code:-32601,message:'Method not found'}};
}

const server = http.createServer((req,res)=>{
  if (req.method === 'OPTIONS') { res.writeHead(204, {'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}); return res.end(); }
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    return fs.createReadStream(path.join(__dirname,'../public/index.html')).pipe(res);
  }
  if (req.method === 'GET' && req.url === '/health') return json(res,200,{ok:true,service:'continuum-alexa-plus'});
  if (req.method === 'GET' && req.url === '/state') return json(res,200,engine.snapshot());
  if (req.method === 'POST' && req.url === '/mcp') {
    let raw=''; req.on('data',d=>raw+=d); req.on('end',()=>{
      try { json(res,200,handleRpc(JSON.parse(raw||'{}'))); }
      catch (e) { json(res,400,{jsonrpc:'2.0',id:null,error:{code:-32000,message:e.message}}); }
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/intent') {
    let raw=''; req.on('data',d=>raw+=d); req.on('end',()=>{
      try {
        const {utterance=''} = JSON.parse(raw||'{}');
        const recalled = engine.recallContext({query:utterance,limit:3});
        const wf = engine.proposeWorkflow({goal:utterance,context:recalled.map(m=>m.text)});
        const executed = engine.executeWorkflow({workflowId:wf.id});
        json(res,200,{recalled, ...executed});
      } catch(e) { json(res,400,{error:e.message}); }
    });
    return;
  }
  json(res,404,{error:'not found'});
});

if (require.main === module) server.listen(PORT,()=>console.log(`Continuum listening on http://localhost:${PORT}`));
module.exports = { server, engine, handleRpc, callTool, tools };
