const API_URL = 'api/tarefas.php';

const listaTarefas = document.getElementById('listaTarefas');
const mensagemVazia = document.getElementById('mensagemVazia');

const modalOverlay = document.getElementById('modalOverlay');
const modalTitulo = document.getElementById('modalTitulo');
const formTarefa = document.getElementById('formTarefa');

const campoId = document.getElementById('tarefaId');
const campoTitulo = document.getElementById('campoTitulo');
const campoDescricao = document.getElementById('campoDescricao');
const campoCategoria = document.getElementById('campoCategoria');
const campoData = document.getElementById('campoData');
const campoPrioridade = document.getElementById('campoPrioridade');
const campoStatus = document.getElementById('campoStatus');

const filtroBusca = document.getElementById('filtroBusca');
const filtroStatus = document.getElementById('filtroStatus');
const filtroPrioridade = document.getElementById('filtroPrioridade');

const LABELS_PRIORIDADE = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const LABELS_STATUS = { pendente: 'Pendente', em_andamento: 'Em andamento', concluida: 'Concluída' };

let temporizadorBusca = null;

document.addEventListener('DOMContentLoaded', carregarTarefas);

document.getElementById('btnNovaTarefa').addEventListener('click', function () {
    abrirModal();
});
document.getElementById('btnFecharModal').addEventListener('click', fecharModal);
document.getElementById('btnCancelar').addEventListener('click', fecharModal);
modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
        fecharModal();
    }
});

filtroStatus.addEventListener('change', carregarTarefas);
filtroPrioridade.addEventListener('change', carregarTarefas);
filtroBusca.addEventListener('input', () => {
    clearTimeout(temporizadorBusca);
    temporizadorBusca = setTimeout(carregarTarefas, 350);
});

formTarefa.addEventListener('submit', salvarTarefa);

async function carregarTarefas() {
    const params = new URLSearchParams();
    if (filtroStatus.value) params.set('status', filtroStatus.value);
    if (filtroPrioridade.value) params.set('prioridade', filtroPrioridade.value);
    if (filtroBusca.value.trim()) params.set('busca', filtroBusca.value.trim());

    try {
        const resposta = await fetch(`${API_URL}?${params.toString()}`);
        const tarefas = await resposta.json();
        renderizarTarefas(tarefas);
        atualizarEstatisticas(tarefas);
    } catch (erro) {
        console.error('Erro ao carregar tarefas:', erro);
        listaTarefas.innerHTML = '<p class="vazio">Não foi possível carregar as tarefas. Verifique a conexão com o banco de dados.</p>';
    }
}

function renderizarTarefas(tarefas) {
    listaTarefas.innerHTML = '';
    mensagemVazia.hidden = tarefas.length > 0;

    tarefas.forEach((tarefa) => {
        listaTarefas.appendChild(criarCardTarefa(tarefa));
    });
}

function criarCardTarefa(tarefa) {
    const card = document.createElement('article');
    card.className = 'tarefa' + (tarefa.status === 'concluida' ? ' concluida' : '');
    card.dataset.prioridade = tarefa.prioridade;

    const vencimento = tarefa.data_vencimento
        ? `<div class="tarefa__vencimento">📅 Vence em ${formatarData(tarefa.data_vencimento)}</div>`
        : '';

    card.innerHTML = `
        <div class="tarefa__topo">
            <h3 class="tarefa__titulo">${escaparHtml(tarefa.titulo)}</h3>
        </div>
        ${tarefa.descricao ? `<p class="tarefa__descricao">${escaparHtml(tarefa.descricao)}</p>` : ''}
        <div class="tarefa__meta">
            <span class="badge badge--categoria">${escaparHtml(tarefa.categoria)}</span>
            <span class="badge badge--prioridade-${tarefa.prioridade}">${LABELS_PRIORIDADE[tarefa.prioridade]}</span>
            <span class="badge badge--status-${tarefa.status}">${LABELS_STATUS[tarefa.status]}</span>
        </div>
        ${vencimento}
        <div class="tarefa__acoes">
            <button type="button" class="editar">Editar</button>
            <button type="button" class="excluir">Excluir</button>
        </div>
    `;

    card.querySelector('.editar').addEventListener('click', () => abrirModal(tarefa));
    card.querySelector('.excluir').addEventListener('click', () => excluirTarefa(tarefa.id, tarefa.titulo));

    return card;
}

function atualizarEstatisticas(tarefas) {
    document.getElementById('statTotal').textContent = tarefas.length;
    document.getElementById('statPendente').textContent = tarefas.filter(t => t.status === 'pendente').length;
    document.getElementById('statAndamento').textContent = tarefas.filter(t => t.status === 'em_andamento').length;
    document.getElementById('statConcluida').textContent = tarefas.filter(t => t.status === 'concluida').length;
}

function abrirModal(tarefa = null) {
    formTarefa.reset();

    if (tarefa) {
        modalTitulo.textContent = 'Editar tarefa';
        campoId.value = tarefa.id;
        campoTitulo.value = tarefa.titulo;
        campoDescricao.value = tarefa.descricao ?? '';
        campoCategoria.value = tarefa.categoria;
        campoData.value = tarefa.data_vencimento ?? '';
        campoPrioridade.value = tarefa.prioridade;
        campoStatus.value = tarefa.status;
    } else {
        modalTitulo.textContent = 'Nova tarefa';
        campoId.value = '';
    }

    modalOverlay.hidden = false;
    campoTitulo.focus();
}

function fecharModal() {
    modalOverlay.hidden = true;
}

async function salvarTarefa(evento) {
    evento.preventDefault();

    const dados = {
        titulo: campoTitulo.value.trim(),
        descricao: campoDescricao.value.trim(),
        categoria: campoCategoria.value.trim(),
        data_vencimento: campoData.value,
        prioridade: campoPrioridade.value,
        status: campoStatus.value,
    };

    const ehEdicao = Boolean(campoId.value);
    if (ehEdicao) dados.id = campoId.value;

    try {
        const resposta = await fetch(API_URL, {
            method: ehEdicao ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            alert(erro.error || 'Erro ao salvar a tarefa.');
            return;
        }

        fecharModal();
        carregarTarefas();
    } catch (erro) {
        console.error('Erro ao salvar tarefa:', erro);
        alert('Erro ao salvar a tarefa.');
    }
}

async function excluirTarefa(id, titulo) {
    var confirmou = confirm('Excluir a tarefa "' + titulo + '"?');
    if (!confirmou) {
        return;
    }

    try {
        await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        carregarTarefas();
    } catch (erro) {
        console.error('Erro ao excluir tarefa:', erro);
        alert('Erro ao excluir a tarefa.');
    }
}

function formatarData(dataIso) {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
