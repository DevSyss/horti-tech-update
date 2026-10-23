(() => {
  const cfg = window.APP_CONFIG;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const api = window.ApiClient.request;
  const toast = (msg, error=false) => {
    const old = $(".toast"); if(old) old.remove();
    const el=document.createElement("div"); el.className="toast"+(error?" error":""); el.textContent=msg; document.body.append(el);
    setTimeout(()=>el.remove(),3600);
  };
  const escapeHtml = v => String(v ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const date = v => { if(!v) return "—"; const d=new Date(v); return isNaN(d)?escapeHtml(v):d.toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}); };
  const currentPage = location.pathname.split("/").pop() || "dashboard.html";
  const entityKey = currentPage.replace(".html","");
  const entity = cfg.ENTITIES[entityKey];
  const navItems = [
    ["dashboard.html","Dashboard","▦"],["alertas.html","Alertas","◉"],["camaras-frias.html","Câmaras frias","❄"],
    ["registros-termicos.html","Registros térmicos","⌁"],["colaboradores.html","Colaboradores","♙"],["usuarios.html","Usuários","♧"]
  ];
  function shell(title, subtitle) {
    document.body.innerHTML = `<div class="app"><aside class="sidebar" id="sidebar">
      <div class="brand"><div class="brand-mark">✳</div><div>hortitech<small>PRO • MONITORAMENTO</small></div></div>
      <div class="nav-label">MENU PRINCIPAL</div><nav class="nav">${navItems.map(([href,label,icon])=>`<a href="${href}" class="${currentPage===href?'active':''}"><span class="nav-icon">${icon}</span>${label}</a>`).join("")}</nav>
      <div class="side-bottom"><span class="online"></span>Sistema de monitoramento<br><strong style="display:block;margin:7px 0 0;color:var(--text)">Conectado ao painel</strong></div>
    </aside><main class="main"><header class="topbar"><div style="display:flex;align-items:center;gap:12px"><button class="icon-btn mobile-menu" id="menuBtn">☰</button><div><div class="eyebrow">HORTITECH / CONTROLE INTELIGENTE</div><h1 class="page-title">${title}</h1><p class="subtitle">${subtitle}</p></div></div><div class="top-actions"><button class="icon-btn" id="themeBtn" title="Alternar tema">☾</button><div class="avatar">HP</div><button class="icon-btn" id="logoutBtn" title="Sair">↗</button></div></header><div id="pageContent"></div></main></div><div class="modal-backdrop" id="modal"></div>`;
    const theme=localStorage.getItem("hortitech_theme")||"light"; document.documentElement.dataset.theme=theme; $("#themeBtn").textContent=theme==="dark"?"☀":"☾";
    $("#themeBtn").onclick=()=>{const t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;localStorage.setItem("hortitech_theme",t);$("#themeBtn").textContent=t==="dark"?"☀":"☾"; if(currentPage==="dashboard.html") drawCharts(window.__dashboardData||[]);};
    $("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
    $("#logoutBtn").onclick=()=>{window.ApiClient.clearSession();location.href="login.html";};
  }
  function openModal(title, fields, record={}, onSave) {
    const modal=$("#modal");
    modal.innerHTML=`<form class="modal" id="recordForm"><div class="modal-head"><h2>${title}</h2><button type="button" class="icon-btn" id="closeModal">×</button></div><div class="form-grid">${fields.map(f=>{
      const val=record[f.key]??"";
      if(f.type==="select") return `<div class="field"><label>${f.label}</label><select name="${f.key}" ${f.required?"required":""}><option value="">Selecione...</option>${f.options.map(o=>`<option ${String(val)===o?"selected":""}>${o}</option>`).join("")}</select></div>`;
      if(f.type==="textarea") return `<div class="field full"><label>${f.label}</label><textarea name="${f.key}" ${f.required?"required":""}>${escapeHtml(val)}</textarea></div>`;
      return `<div class="field"><label>${f.label}</label><input name="${f.key}" type="${f.type||"text"}" value="${escapeHtml(val)}" ${f.required?"required":""} ${f.type==="number"?'step="any"':""}></div>`;
    }).join("")}</div><div class="modal-foot"><button type="button" class="btn secondary" id="cancelModal">Cancelar</button><button class="btn" type="submit">Salvar registro</button></div></form>`;
    modal.classList.add("open"); const close=()=>modal.classList.remove("open");
    $("#closeModal").onclick=$("#cancelModal").onclick=close;
    $("#recordForm").onsubmit=async e=>{e.preventDefault();const data={};new FormData(e.target).forEach((v,k)=>{if(v!=="")data[k]=v;});fields.forEach(f=>{if(f.type==="number"&&data[f.key]!==undefined)data[f.key]=Number(data[f.key]);});try{await onSave(data);close();}catch(err){toast(err.message,true);}};
  }
  const findId = r => r.id ?? r.idAlerta ?? r.idCamaraFria ?? r.idColaborador ?? r.idRegistro ?? r.idUsuario;
  function tableMarkup(rows, fields, label) {
    if(!rows.length)return `<div class="empty">Nenhum registro encontrado. Clique em <b>+ Novo registro</b> para começar.</div>`;
    return `<div class="table-scroll"><table><thead><tr>${fields.map(f=>`<th>${f.label}</th>`).join("")}<th>AÇÕES</th></tr></thead><tbody>${rows.map(r=>`<tr>${fields.map(f=>`<td>${f.key.toLowerCase().includes("data")?date(r[f.key]):escapeHtml(r[f.key]??"—")}</td>`).join("")}<td><div class="row-actions"><button class="mini-btn" data-edit="${escapeHtml(findId(r))}">Editar</button><button class="mini-btn" data-delete="${escapeHtml(findId(r))}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;
  }
  async function renderEntity() {
    shell(entity.label,`Gerencie e acompanhe os dados de ${entity.label.toLowerCase()} em um só lugar.`);
    const content=$("#pageContent");
    content.innerHTML=`<section class="panel table-panel"><div class="table-toolbar"><div><h2>${entity.label} cadastrados</h2><div class="panel-sub">Dados sincronizados com a API Spring Boot</div></div><div style="display:flex;gap:9px;flex-wrap:wrap"><input class="search" id="search" placeholder="Buscar registro..."><button class="btn" id="newBtn">＋ Novo registro</button></div></div><div id="records"><div class="empty">Carregando dados da API...</div></div></section>`;
    let rows=[];
    const refresh=async()=>{try{const result=await api(entity.endpoint);rows=Array.isArray(result)?result:(result?.content||result?.data||[]);paint();}catch(e){$("#records").innerHTML=`<div class="empty">Não foi possível carregar a API.<br><br><b>${escapeHtml(e.message)}</b><br><br>Confira API_BASE_URL, endpoint e CORS no Spring Boot.</div>`;}};
    const fields=entity.fields;
    const paint=()=>{const q=$("#search").value.toLowerCase();const filtered=rows.filter(r=>fields.some(f=>String(r[f.key]??"").toLowerCase().includes(q)));$("#records").innerHTML=tableMarkup(filtered,fields,entity.label);
      $$("[data-edit]",$("#records")).forEach(b=>b.onclick=()=>{const r=rows.find(x=>String(findId(x))===b.dataset.edit);if(!r)return;openModal("Editar registro",fields,r,async d=>{await api(`${entity.endpoint}/${encodeURIComponent(findId(r))}`,{method:"PUT",body:JSON.stringify(d)});toast("Registro atualizado!");await refresh();});});
      $$("[data-delete]",$("#records")).forEach(b=>b.onclick=async()=>{if(!confirm("Deseja excluir este registro? Esta ação não pode ser desfeita."))return;try{await api(`${entity.endpoint}/${encodeURIComponent(b.dataset.delete)}`,{method:"DELETE"});toast("Registro excluído.");await refresh();}catch(e){toast(e.message,true);}});
    };
    $("#search").oninput=paint;
    $("#newBtn").onclick=()=>openModal("Novo registro",fields,{},async d=>{await api(entity.endpoint,{method:"POST",body:JSON.stringify(d)});toast("Registro cadastrado!");await refresh();});
    await refresh();
  }
  function drawCharts(rows) {
    const canvas=$("#tempChart"); if(!canvas)return;
    const ctx=canvas.getContext("2d"), rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
    canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;ctx.scale(dpr,dpr);
    const w=rect.width,h=rect.height,css=getComputedStyle(document.documentElement),line=css.getPropertyValue("--line"),muted=css.getPropertyValue("--muted"),green=css.getPropertyValue("--green");
    ctx.clearRect(0,0,w,h);const vals=rows.map(r=>Number(r.temperatura??r.temperaturaAtual)).filter(Number.isFinite).slice(-8);
    const data=vals.length?vals:[4.1,3.8,4.4,4.2,3.9,4.3,4.0];
    const min=Math.min(...data)-1,max=Math.max(...data)+1,pad=22;
    ctx.font="10px DM Sans";ctx.strokeStyle=line;ctx.fillStyle=muted;ctx.lineWidth=1;
    for(let i=0;i<5;i++){const y=pad+(h-pad*2)*i/4;ctx.beginPath();ctx.moveTo(28,y);ctx.lineTo(w-8,y);ctx.stroke();ctx.fillText((max-(max-min)*i/4).toFixed(1),0,y+3);}
    const points=data.map((v,i)=>({x:34+(w-48)*(data.length===1?.5:i/(data.length-1)),y:pad+(h-pad*2)*(max-v)/(max-min)}));
    const grad=ctx.createLinearGradient(0,pad,0,h);grad.addColorStop(0,green+"55");grad.addColorStop(1,green+"00");
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineTo(points[points.length-1].x,h-pad);ctx.lineTo(points[0].x,h-pad);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=green;ctx.lineWidth=2.5;ctx.lineJoin="round";ctx.stroke();
    points.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);ctx.fillStyle=green;ctx.fill();ctx.strokeStyle=css.getPropertyValue("--surface");ctx.lineWidth=2;ctx.stroke();});
  }
  async function renderDashboard(){
    shell("Visão geral","Acompanhe a operação e a segurança térmica em tempo real.");
    $("#pageContent").innerHTML=`<div class="grid stats"><div class="stat"><div class="stat-top">Câmaras frias <span class="stat-icon">❄</span></div><div class="stat-value" id="sCamaras">—</div><div class="stat-note">Unidades cadastradas</div></div><div class="stat"><div class="stat-top">Registros térmicos <span class="stat-icon">⌁</span></div><div class="stat-value" id="sRegistros">—</div><div class="stat-note">Leituras armazenadas</div></div><div class="stat"><div class="stat-top">Alertas ativos <span class="stat-icon">◉</span></div><div class="stat-value" id="sAlertas">—</div><div class="stat-note">Precisam de atenção</div></div><div class="stat"><div class="stat-top">Colaboradores <span class="stat-icon">♙</span></div><div class="stat-value" id="sColabs">—</div><div class="stat-note">Pessoas cadastradas</div></div></div>
    <div class="grid dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>Histórico de temperatura</h2><div class="panel-sub">Últimas leituras disponíveis na API (°C)</div></div><span class="pill">LIVE DATA</span></div><div class="chart-wrap"><canvas id="tempChart"></canvas></div></section><section class="panel"><div class="panel-head"><div><h2>Resumo de alertas</h2><div class="panel-sub">Situação atual dos alertas</div></div><span class="stat-icon">◉</span></div><div id="alertSummary" class="activity-list"><div class="empty">Buscando dados...</div></div></section></div>
    <section class="panel"><div class="panel-head"><div><h2>Leituras recentes</h2><div class="panel-sub">Últimos registros térmicos recebidos</div></div><a href="registros-termicos.html" style="color:var(--green);font-size:12px;text-decoration:none;font-weight:800">Ver todos ↗</a></div><div id="recentTable"><div class="empty">Carregando leituras...</div></div></section>`;
    const get=async key=>{try{const d=await api(cfg.ENTITIES[key].endpoint);return Array.isArray(d)?d:(d?.content||d?.data||[]);}catch{return[];}};
    const [cams,regs,alerts,colabs]=await Promise.all([get("camaras-frias"),get("registros-termicos"),get("alertas"),get("colaboradores")]);
    window.__dashboardData=regs;
    $("#sCamaras").textContent=cams.length;$("#sRegistros").textContent=regs.length;$("#sAlertas").textContent=alerts.filter(a=>!String(a.status||"").toLowerCase().includes("resolvido")).length;$("#sColabs").textContent=colabs.length;
    const active=alerts.slice(0,5);
    $("#alertSummary").innerHTML=active.length?active.map(a=>`<div class="activity"><div class="activity-dot" style="background:${/cr[ií]tico|alto/i.test(a.nivel||"")?'var(--danger)':'var(--green)'}"></div><div style="flex:1"><strong>${escapeHtml(a.titulo||a.mensagem||"Alerta")}</strong><span>${escapeHtml(a.nivel||"Sem nível")} · ${escapeHtml(a.status||"Sem status")}</span></div><span class="pill ${/cr[ií]tico|alto/i.test(a.nivel||"")?'bad':'warn'}">${escapeHtml(a.nivel||"Info")}</span></div>`).join(""):`<div class="empty">Nenhum alerta encontrado.</div>`;
    const fields=[{key:"camaraFria",label:"Câmara fria"},{key:"temperatura",label:"Temperatura"},{key:"dataHora",label:"Data e hora"}];
    $("#recentTable").innerHTML=tableMarkup(regs.slice().reverse().slice(0,5),fields,"Registros térmicos");
    $$("#recentTable [data-edit], #recentTable [data-delete]").forEach(b=>b.remove());
    drawCharts(regs);window.addEventListener("resize",()=>drawCharts(window.__dashboardData||[]),{passive:true});
  }
  async function authPage(register=false){
    document.body.innerHTML=`<div class="login-page"><section class="login-art"><div class="brand"><div class="brand-mark">✳</div><div>hortitech<small>PRO • MONITORAMENTO</small></div></div><div class="art-copy"><div class="eyebrow">TECNOLOGIA QUE CUIDA</div><h1>Controle inteligente.<br>Operação tranquila.</h1><p>Monitore temperaturas, gerencie câmaras frias e mantenha seus dados operacionais organizados em uma plataforma simples e moderna.</p></div><div class="art-bottom">© 2026 Hortitech Pro · Plataforma de monitoramento</div></section><section class="login-form-wrap"><form class="login-form" id="authForm"><div class="brand"><div class="brand-mark">✳</div><div>hortitech<small>PRO • ACESSO SEGURO</small></div></div><h2>${register?"Crie sua conta":"Boas-vindas de volta"}</h2><p>${register?"Preencha os dados para começar a usar a plataforma.":"Entre com suas credenciais para acessar o painel."}</p>${register?`<div class="field"><label>Nome completo</label><input name="nome" placeholder="Como podemos te chamar?" required></div>`:""}<div class="field"><label>E-mail</label><input name="email" type="email" placeholder="voce@empresa.com" required autocomplete="email"></div><div class="field"><label>Senha</label><div class="password-wrap"><input name="senha" type="password" placeholder="Mínimo de 6 caracteres" required minlength="6" autocomplete="${register?"new-password":"current-password"}"><button type="button" class="password-toggle" id="togglePass">◉</button></div></div><button class="btn" type="submit">${register?"Criar conta →":"Entrar na plataforma →"}</button><div class="switch-auth">${register?"Já tem uma conta?":"Ainda não tem acesso?"} <a href="${register?"login.html":"cadastro.html"}">${register?"Fazer login":"Criar conta"}</a></div><div class="switch-auth" style="margin-top:10px"><a href="dashboard.html">Abrir painel de demonstração</a></div></form></section></div>`;
    $("#togglePass").onclick=()=>{const p=$('[name="senha"]');p.type=p.type==="password"?"text":"password";};
    $("#authForm").onsubmit=async e=>{e.preventDefault();const data={};new FormData(e.target).forEach((v,k)=>data[k]=v);const btn=$("button[type=submit]",e.target);btn.disabled=true;btn.textContent="Aguarde...";
      try{const result=await api(register?cfg.AUTH.cadastro:cfg.AUTH.login,{method:"POST",body:JSON.stringify(data)});
        if(register){toast("Cadastro realizado! Faça login para continuar.");location.href="login.html";return;}
        const t=result?.token||result?.accessToken||result?.jwt;
        if(t)sessionStorage.setItem("hortitech_token",t);
        if(result?.usuario)sessionStorage.setItem("hortitech_user",JSON.stringify(result.usuario));
        location.href="dashboard.html";
      }catch(err){toast(err.message+(err.message.includes("Failed to fetch")?" — confira se o Spring Boot está rodando e se a URL está correta.":""),true);btn.disabled=false;btn.textContent=register?"Criar conta →":"Entrar na plataforma →";}
    };
  }
  if(currentPage==="login.html")authPage(false);
  else if(currentPage==="cadastro.html")authPage(true);
  else if(currentPage==="dashboard.html"||currentPage==="index.html")renderDashboard();
  else if(entity)renderEntity();
  else {location.href="dashboard.html";}
})();
