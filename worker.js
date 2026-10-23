const CONFIG = {
  path: 'gacha_info/api/getBeyondGachaLog',
  types: {
    '1000': 'Standard Ode',
    '2000': 'Event Odes'
  },
  pageSize: 5
};

const HOSTS = {
  os: 'public-operation-hk4e-sg.hoyoverse.com',
  cn: 'public-operation-hk4e.mihoyo.com'
};

const PASS = ['authkey', 'authkey_ver', 'sign_type', 'auth_appid', 'game_biz', 'region', 'lang'];

const HTML = [
  '<!doctype html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="utf-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  '  <title>Odes History Extractor</title>',
  '  <style>',
  '    :root{--bg:#fff;--fg:#1c1c1e;--mut:#6b6b70;--bd:#d9d9de;--ac:#3a5bd9;--sf:#f5f5f7}',
  '    @media(prefers-color-scheme:dark){:root{--bg:#18181b;--fg:#ececef;--mut:#9a9aa2;--bd:#35353b;--ac:#7f9bff;--sf:#222226}}',
  '    *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}',
  '    main{max-width:860px;margin:0 auto;padding:24px 16px}',
  '    h1{font-size:22px;margin:0 0 4px}',
  '    p.s{color:var(--mut);margin:0 0 20px}',
  '    label{display:block;font-size:13px;color:var(--mut);margin:12px 0 4px}',
  '    input,select,textarea{width:100%;padding:8px;border:1px solid var(--bd);border-radius:6px;background:var(--sf);color:var(--fg);font:inherit}',
  '    textarea{min-height:70px;font:13px ui-monospace,monospace}',
  '    .row{display:flex;gap:12px;flex-wrap:wrap}.row>div{flex:1;min-width:200px}',
  '    button{padding:8px 14px;border:1px solid var(--bd);border-radius:6px;background:var(--sf);color:var(--fg);font:inherit;cursor:pointer}',
  '    button.p{background:var(--ac);border-color:var(--ac);color:#fff}button:disabled{opacity:.5;cursor:default}',
  '    .bar{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}',
  '    #st{margin-top:12px;color:var(--mut);min-height:22px}#st.err{color:#d33}',
  '    .card{border:1px solid var(--bd);border-radius:8px;padding:12px 14px;margin-top:16px}.card h2{font-size:16px;margin:0 0 6px}',
  '    .k{color:var(--mut)}.tw{overflow-x:auto;margin-top:10px}table{border-collapse:collapse;width:100%;font-size:13px}',
  '    th,td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--bd);white-space:nowrap}th{color:var(--mut);font-weight:500}',
  '  </style>',
  '</head>',
  '<body>',
  '  <main>',
  '    <h1>Odes History Extractor</h1>',
  '    <p class="s">Pulls your Miliastra Wonderland Ode history using the temporary key from the in-game history page. Runs locally; nothing is stored.</p>',
  '    <label for="url">Odes history page URL (contains authkey)</label>',
  '    <textarea id="url" placeholder="Paste the URL from the in-game history page"></textarea>',
  '    <div class="row">',
  '      <div>',
  '        <label for="region">Server region</label>',
  '        <select id="region">',
  '          <option value="os">Global (America / Europe / Asia / TW-HK-MO)</option>',
  '          <option value="cn">China</option>',
  '        </select>',
  '      </div>',
  '    </div>',
  '    <div class="bar">',
  '      <button id="go" class="p">Fetch history</button>',
  '      <button id="csv" disabled>Export CSV</button>',
  '      <button id="json" disabled>Export JSON</button>',
  '    </div>',
  '    <div id="st"></div>',
  '    <div id="out"></div>',
  '  </main>',
  '  <script>',
  '    const $=id=>document.getElementById(id);',
  '    let all=[];',
  '    let pageSize=5;',
  '    let types=[];',
  '    let configError="";',
  '    const st=(t,e)=>{$("st").textContent=t;$("st").className=e?"err":""};',
  '    const configReady=fetch("/api/config").then(r=>{',
  '      if(!r.ok) throw new Error("Could not load app configuration.");',
  '      return r.json();',
  '    }).then(c=>{',
  '      types=Object.entries(c.types||{}).map(([code,label])=>({code,label}));',
  '      pageSize=Number(c.pageSize)||5;',
  '    }).catch(e=>{',
  '      configError=e.message;',
  '      st(configError,1);',
  '    });',
  '    $("go").onclick=async()=>{',
  '      await configReady;',
  '      if(configError){st(configError,1);return}',
  '      const url=$("url").value.trim();',
  '      if(!url){st("Paste your history URL first.",1);return}',
  '      if(!types.length){st("No banner types are configured.",1);return}',
  '      $("go").disabled=true;all=[];$("out").innerHTML="";',
  '      try{',
  '        for(const t of types){',
  '          let page=1,endId=0,n=0;',
  '          for(;;){',
  '            st("Fetching "+t.label+", page "+page+" ("+n+" so far)…");',
  '            const r=await (await fetch("/api/log",{method:"POST",body:JSON.stringify({url,region:$("region").value,gachaType:t.code,page,endId})})).json();',
  '            if(r.retcode!==0){',
  '              throw new Error(r.message==="authkey timeout"?"Authkey expired. Reopen the Odes history in-game and get a fresh URL.":r.message||"API error");',
  '            }',
  '            const list=r.data.list||[];',
  '            for(const w of list){w._label=t.label;all.push(w)}',
  '            n+=list.length;',
  '            if(list.length<pageSize) break;',
  '            endId=list[list.length-1].id;page++;',
  '            await new Promise(r=>setTimeout(r,400));',
  '          }',
  '        }',
  '        render();st("Done: "+all.length+" records.");',
  '        $("csv").disabled=$("json").disabled=!all.length;',
  '      }catch(e){st(e.message,1)}',
  '      $("go").disabled=false;',
  '    };',
  '    function render(){',
  '      const out=$("out");out.innerHTML="";',
  '      const groups={};for(const w of all)(groups[w._label]??=[]).push(w);',
  '      for(const [label,list] of Object.entries(groups)){',
  '        const top=Math.max(...list.map(w=>+w.rank_type));',
  '        const idx=list.findIndex(w=>+w.rank_type===top);',
  '        const counts={};for(const w of list)counts[w.rank_type]=(counts[w.rank_type]||0)+1;',
  '        const card=document.createElement("div");card.className="card";',
  '        const h=document.createElement("h2");h.textContent=label;card.appendChild(h);',
  '        const s=document.createElement("div");',
  '        s.innerHTML="<span class=\"k\">Total</span> "+list.length+" · <span class=\"k\">Pulls since last rank-"+top+"</span> "+(idx<0?list.length:idx)+" · <span class=\"k\">By rank</span> "+Object.entries(counts).map(([k,v])=>k+"★ ×"+v).join(", ");',
  '        card.appendChild(s);',
  '        const tw=document.createElement("div");tw.className="tw";',
  '        const tb=document.createElement("table");',
  '        tb.innerHTML="<tr><th>Time</th><th>Name</th><th>Type</th><th>Rank</th></tr>";',
  '        for(const w of list){',
  '          const tr=tb.insertRow();',
  '          [w.time,w.name||w.item_name,w.item_type,w.rank_type].forEach(v=>{tr.insertCell().textContent=v});',
  '        }',
  '        tw.appendChild(tb);card.appendChild(tw);out.appendChild(card);',
  '      }',
  '    }',
  '    function dl(name,text,type){',
  '      const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href);',
  '    }',
  '    $("csv").onclick=()=>{',
  '      const q=v=>"\""+String(v??"").replace(/"/g,"\"\"")+"\"";',
  '      const rows=[["uid","banner","gacha_type","time","name","item_type","rank_type","id"]];',
  '      for(const w of all)rows.push([w.uid,w._label,w.gacha_type||w.op_gacha_type,w.time,w.name||w.item_name,w.item_type,w.rank_type,w.id]);',
  '      dl("odes-history.csv",rows.map(r=>r.map(q).join(",")).join("\\n"),"text/csv");',
  '    };',
  '    $("json").onclick=()=>dl("odes-history.json",JSON.stringify(all,null,2),"application/json");',
  '  </script>',
  '</body>',
  '</html>'
].join('\n');

async function fetchLog(body) {
  const cfg = CONFIG;
  const p = (body.path || cfg.path || '').replace(/^\/+/, '');
  if (!p) return { retcode: -1, message: 'Odes endpoint path is not configured (see README).' };
  if (!/^[\w\/-]+$/.test(p)) return { retcode: -1, message: 'Invalid endpoint path.' };

  const host = HOSTS[body.region];
  if (!host) return { retcode: -1, message: 'Unknown region.' };

  let src;
  try {
    src = new URL(body.url);
  } catch {
    return { retcode: -1, message: 'That is not a valid URL.' };
  }

  if (!src.searchParams.get('authkey')) return { retcode: -1, message: 'No authkey found in the URL.' };

  const u = new URL(`https://${host}/${p}`);
  for (const key of PASS) {
    if (src.searchParams.has(key)) u.searchParams.set(key, src.searchParams.get(key));
  }

  u.searchParams.set('gacha_type', String(body.gachaType));
  u.searchParams.set('page', String(body.page || 1));
  u.searchParams.set('size', String(cfg.pageSize || 20));
  u.searchParams.set('end_id', String(body.endId || 0));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(u, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    return await response.json();
  } catch (error) {
    return { retcode: -1, message: 'Upstream request failed: ' + error.message };
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/config') {
      return jsonResponse(CONFIG);
    }

    if (request.method === 'POST' && url.pathname === '/api/log') {
      try {
        const payload = await request.json();
        return jsonResponse(await fetchLog(payload));
      } catch {
        return jsonResponse({ retcode: -1, message: 'Bad request.' }, 400);
      }
    }

    return jsonResponse({ error: 'not found' }, 404);
  }
};
