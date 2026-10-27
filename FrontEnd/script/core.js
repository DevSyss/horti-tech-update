/* HortiTech Update — UI compartilhada e integração REST com Spring Boot. */
(() => {
  "use strict";
  const cfg = window.APP_CONFIG || {}, $ = (s, r=document) => r.querySelector(s), $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const api = (path, options) => window.ApiClient.request(path, options);
  const currentPage = location.pathname.split("/").pop() || "index.html";
  const pageKeys = {"alerta.html":"alertas", "cadastroCamara.html":"camaras-frias", "historico.html":"registros-termicos", "informacoes.html":"colaboradores"};
  const rowsOf = d => Array.isArray(d) ? d : (d?.content || d?.data || d?.items || []);
  const idOf = r => r?.id;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const toast = (msg, bad=false) => { $(".toast")?.remove(); const el=document.createElement("div"); el.className="toast"+(bad?" error":""); el.textContent=msg; document.body.append(el); setTimeout(()=>el.remove(),4500); };
  const dateForInput = v => { if(!v) return ""; const s=String(v); return s.length>=16 ? s.slice(0,16) : s; };
  const format = (v,k="") => { if(v===null||v===undefined||v==="") return "—"; if(/dataHora/i.test(k)){ const d=new Date(v); return Number.isNaN(d.getTime())?esc(v):d.toLocaleString("pt-BR"); } if(typeof v==="boolean") return v?"Resolvido":"Pendente"; return esc(v); };
  function shell(title, subtitle) {
    if($("#pageTitle")) $("#pageTitle").textContent=title; if($("#pageSubtitle")) $("#pageSubtitle").textContent=subtitle;
    $$(".nav a").forEach(a=>a.classList.toggle("active",a.dataset.page===currentPage));
    const applyTheme = theme => { document.documentElement.dataset.theme=theme; localStorage.setItem("hortitech_theme",theme); const b=$("#themeBtn"); if(b)b.textContent=theme==="dark"?"☀":"☾"; };
    applyTheme(localStorage.getItem("hortitech_theme")||"light");
    const themeBtn=$("#themeBtn"); if(themeBtn) themeBtn.onclick=()=>applyTheme(document.documentElement.dataset.theme==="dark"?"light":"dark");
    const menu=$("#menuBtn"); if(menu) menu.onclick=()=>$("#sidebar")?.classList.toggle("open");
    const logout=$("#logoutBtn"); if(logout) logout.onclick=()=>{window.ApiClient.clearSession();location.href="login.html";};
  }
  function openModal(title, fields, record, save) {
    const modal=$("#modal"); if(!modal) { toast("Janela de cadastro não encontrada nesta página.",true); return; }
    const fieldMarkup=fields.map(f=>{
      let val=record?.[f.key] ?? ""; if(f.type==="datetime-local") val=dateForInput(val); if(f.valueType==="boolean"||f.type==="select") val=String(val);
      const label=`<label for="field-${f.key}">${esc(f.label)}</label>`; const req=f.required?"required":"";
      if(f.type==="select") return `<div class="field ${f.full?"full":""}">${label}<select id="field-${f.key}" name="${f.key}" ${req}><option value="">Selecione...</option>${(f.options||[]).map(o=>{const x=typeof o==="object"?o:{value:o,label:o};return `<option value="${esc(x.value)}" ${String(val)===String(x.value)?"selected":""}>${esc(x.label)}</option>`}).join("")}</select></div>`;
      if(f.type==="textarea") return `<div class="field full">${label}<textarea id="field-${f.key}" name="${f.key}" ${req}>${esc(val)}</textarea></div>`;
      return `<div class="field ${f.full?"full":""}">${label}<input id="field-${f.key}" name="${f.key}" type="${f.type||"text"}" value="${esc(val)}" ${req} ${f.type==="number"?'step="any"':''} ${f.maxLength?`maxlength="${f.maxLength}"`:""} ${f.pattern?`pattern="${f.pattern}"`:""}></div>`;
    }).join("");
    modal.innerHTML=`<form class="modal" id="recordForm"><div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" id="closeModal" aria-label="Fechar">×</button></div><div class="form-grid">${fieldMarkup}</div><div class="modal-foot"><button type="button" class="btn secondary" id="cancelModal">Cancelar</button><button class="btn" type="submit">Salvar</button></div></form>`;
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
    const close=()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true");};
    $("#closeModal").onclick=$("#cancelModal").onclick=close; modal.onclick=e=>{if(e.target===modal)close();};
    document.onkeydown=e=>{if(e.key==="Escape"&&modal.classList.contains("open"))close();};
    $("#recordForm").onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form).entries());
      fields.forEach(f=>{if(f.type==="number")data[f.key]=data[f.key]===""?null:Number(data[f.key]);if(f.type==="datetime-local"&&data[f.key])data[f.key]=data[f.key]+(data[f.key].length===16?":00":"");if(f.valueType==="boolean")data[f.key]=data[f.key]==="true";});
      const btn=$('button[type="submit"]',form);btn.disabled=true;btn.textContent="Salvando...";try{await save(data);close();}catch(err){toast(err.message||"Não foi possível salvar.",true);btn.disabled=false;btn.textContent="Salvar";}
    };
  }
  function tableMarkup(data, fields) {
    if(!data.length)return `<div class="empty">Nenhum registro encontrado. Use <b>＋ Novo registro</b> para cadastrar o primeiro.</div>`;
    return `<div class="table-scroll"><table><thead><tr>${fields.map(f=>`<th>${esc(f.label)}</th>`).join("")}<th>AÇÕES</th></tr></thead><tbody>${data.map(r=>`<tr>${fields.map(f=>`<td>${format(r?.[f.key],f.key)}</td>`).join("")}<td><div class="row-actions"><button class="mini-btn" data-edit="${esc(idOf(r))}">Editar</button><button class="mini-btn" data-delete="${esc(idOf(r))}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;
  }
  async function renderEntity(key) {
    const ent=cfg.ENTITIES[key]; if(!ent)throw new Error(`Entidade ${key} não configurada.`); shell(ent.label,ent.subtitle||`Gerencie ${ent.label.toLowerCase()}.`); if($("#entityTitle"))$("#entityTitle").textContent=`${ent.label} cadastrados`;
    let data=[]; const records=$("#records");
    const refresh=async()=>{try{data=rowsOf(await api(ent.endpoint));paint();}catch(err){records.innerHTML=`<div class="empty">Não foi possível carregar os dados da API.<br><br><b>${esc(err.message)}</b><br><br>Verifique se o BackEnd está executando em http://localhost:8080.</div>`;}};
    const paint=()=>{const q=($("#search")?.value||"").toLowerCase();const filtered=data.filter(r=>ent.fields.some(f=>String(r?.[f.key]??"").toLowerCase().includes(q)));records.innerHTML=tableMarkup(filtered,ent.fields);
      $$('[data-edit]',records).forEach(b=>b.onclick=()=>{const row=data.find(r=>String(idOf(r))===b.dataset.edit);if(!row)return;openModal(`Editar ${ent.label.toLowerCase()}`,ent.fields,row,async payload=>{await api(`${ent.endpoint}/${row.id}`,{method:"PUT",body:JSON.stringify(payload)});toast("Registro atualizado.");await refresh();});});
      $$('[data-delete]',records).forEach(b=>b.onclick=async()=>{if(!confirm("Deseja excluir este registro permanentemente?"))return;try{await api(`${ent.endpoint}/${b.dataset.delete}`,{method:"DELETE"});toast("Registro excluído.");await refresh();}catch(e){toast(e.message,true);}});
    };
    if($("#search"))$("#search").oninput=paint;
    if($("#newBtn"))$("#newBtn").onclick=()=>openModal(`Novo cadastro: ${ent.label.toLowerCase()}`,ent.fields,{},async payload=>{await api(ent.endpoint,{method:"POST",body:JSON.stringify(payload)});toast("Cadastro salvo no banco de dados.");await refresh();});
    if($("#refreshBtn"))$("#refreshBtn").onclick=refresh;
    await refresh();
  }
  function authPage(register=false){const form=$("#authForm");if(!form)return;shellAuth();const toggle=$("#togglePass");if(toggle)toggle.onclick=()=>{const input=$("#senha");input.type=input.type==="password"?"text":"password";};
    const cpf=$("#cpf");if(cpf)cpf.oninput=()=>{let d=cpf.value.replace(/\D/g,"").slice(0,11);if(d.length>9)d=d.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/,"$1.$2.$3-$4");else if(d.length>6)d=d.replace(/(\d{3})(\d{3})(\d{1,3})/,"$1.$2.$3");else if(d.length>3)d=d.replace(/(\d{3})(\d{1,3})/,"$1.$2");cpf.value=d;};
    form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;const values=Object.fromEntries(new FormData(form).entries()),btn=$('button[type="submit"]',form),old=btn.textContent;btn.disabled=true;btn.textContent="Aguarde...";
      try{const email=String(values.email||"").trim().toLowerCase();let result;
        if(register){const nome=String(values.nome||"").trim(),cpfRaw=String(values.cpf||"").replace(/\D/g,"");if(!/^[\p{L} ]+$/u.test(nome))throw Error("O nome deve conter apenas letras e espaços.");if(cpfRaw.length!==11)throw Error("Informe um CPF válido com 11 dígitos.");
          // O controller de colaboradores cria também o usuário usado no login.
          result=await api(cfg.AUTH.cadastro,{method:"POST",body:JSON.stringify({nome,cpf:values.cpf,email,senha:values.senha})});toast("Conta criada! Você já pode entrar.");setTimeout(()=>location.href="login.html",900);return;
        } else {result=await api(cfg.AUTH.login,{method:"POST",body:JSON.stringify({email,senha:values.senha})});if(!result)throw Error("E-mail ou senha incorretos.");sessionStorage.setItem("hortitech_user",JSON.stringify({id:result.id,email:result.email}));location.href="index.html";}
      }catch(err){toast(err.message||"Não foi possível concluir a operação.",true);btn.disabled=false;btn.textContent=old;}
    };
  }
  function shellAuth(){document.documentElement.dataset.theme=localStorage.getItem("hortitech_theme")||"light";}
  async function renderDashboard(){shell("Visão geral","Acompanhe a operação e a segurança térmica em um só lugar.");
    try{const [cams,regs,alerts,colabs]=await Promise.all(["camaras-frias","registros-termicos","alertas","colaboradores"].map(k=>api(cfg.ENTITIES[k].endpoint).then(rowsOf)));
      if($("#sCamaras"))$("#sCamaras").textContent=cams.length;if($("#sRegistros"))$("#sRegistros").textContent=regs.length;if($("#sAlertas"))$("#sAlertas").textContent=alerts.filter(a=>!a.status).length;if($("#sColabs"))$("#sColabs").textContent=colabs.length;
      if($("#alertSummary"))$("#alertSummary").innerHTML=alerts.slice(-5).reverse().map(a=>`<div class="activity"><div class="activity-dot ${a.status?"activity-dot-normal":"activity-dot-danger"}"></div><div class="activity-content"><strong>${esc(a.mensagem)}</strong><span>${format(a.dataHora,"dataHora")}</span></div><span class="pill ${a.status?"good":"warn"}">${a.status?"Resolvido":"Pendente"}</span></div>`).join("")||`<div class="empty">Nenhum alerta cadastrado.</div>`;
      if($("#recentTable"))$("#recentTable").innerHTML=regs.length?`<div class="table-scroll"><table><thead><tr><th>Temperatura</th><th>Umidade</th><th>Data e hora</th></tr></thead><tbody>${regs.slice(-5).reverse().map(r=>`<tr><td>${format(r.temperatura)} °C</td><td>${format(r.umidade)}%</td><td>${format(r.dataHora,"dataHora")}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">Ainda não existem registros térmicos.</div>`;
      drawChart(regs);
    }catch(err){["sCamaras","sRegistros","sAlertas","sColabs"].forEach(id=>{if($("#"+id))$("#"+id).textContent="—";});if($("#alertSummary"))$("#alertSummary").innerHTML=`<div class="empty">Não foi possível consultar o BackEnd: ${esc(err.message)}</div>`;if($("#recentTable"))$("#recentTable").innerHTML=`<div class="empty">Confira o Spring Boot e a configuração CORS.</div>`;drawChart([]);}
  }
  function drawChart(regs){const c=$("#tempChart");if(!c)return;const r=c.getBoundingClientRect();if(!r.width||!r.height)return;const ctx=c.getContext("2d"),dpr=devicePixelRatio||1;c.width=r.width*dpr;c.height=r.height*dpr;ctx.scale(dpr,dpr);const w=r.width,h=r.height;ctx.clearRect(0,0,w,h);const vals=regs.map(x=>Number(x.temperatura)).filter(Number.isFinite).slice(-12);const color=getComputedStyle(document.documentElement).getPropertyValue("--green").trim()||"#4c9b68";ctx.strokeStyle=color;ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--muted");ctx.font="12px sans-serif";if(!vals.length){ctx.textAlign="center";ctx.fillText("Sem dados térmicos",w/2,h/2);return;}let min=Math.min(...vals),max=Math.max(...vals);if(min===max){min--;max++;}const pts=vals.map((v,i)=>({x:25+(w-40)*(vals.length===1?.5:i/(vals.length-1)),y:15+(h-35)*(max-v)/(max-min)}));for(let i=0;i<4;i++){const y=15+(h-35)*i/3;ctx.globalAlpha=.2;ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(w-8,y);ctx.stroke();}ctx.globalAlpha=1;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineWidth=2.5;ctx.stroke();pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});}
  window.HortiTechPages={login:()=>authPage(false),cadastro:()=>authPage(true),dashboard:renderDashboard,alertas:()=>renderEntity("alertas"),camarasFrias:()=>renderEntity("camaras-frias"),registrosTermicos:()=>renderEntity("registros-termicos"),colaboradores:()=>renderEntity("colaboradores")};
  document.addEventListener("DOMContentLoaded",()=>{const key=pageKeys[currentPage];if(key)window.HortiTechPages[{"alertas":"alertas","camaras-frias":"camarasFrias","registros-termicos":"registrosTermicos","colaboradores":"colaboradores"}[key]]().catch(e=>toast(e.message,true));else if(currentPage==="index.html")renderDashboard();else if(currentPage==="login.html")authPage(false);else if(currentPage==="cadastro.html")authPage(true);});
})();
