<?php

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

exigirLoginApi();

$metodo = $_SERVER['REQUEST_METHOD'];
$dadosEntrada = json_decode(file_get_contents('php://input'), true);
if (!$dadosEntrada) {
    $dadosEntrada = [];
}

if ($metodo == 'GET') {
    listarTarefas($pdo);
} else if ($metodo == 'POST') {
    criarTarefa($pdo, $dadosEntrada);
} else if ($metodo == 'PUT') {
    atualizarTarefa($pdo, $dadosEntrada);
} else if ($metodo == 'DELETE') {
    excluirTarefa($pdo);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}

function listarTarefas($pdo)
{
    $sql = "SELECT * FROM tarefas WHERE usuario_id = :usuario_id";
    $params = [':usuario_id' => $_SESSION['usuario_id']];

    if (!empty($_GET['status'])) {
        $sql .= " AND status = :status";
        $params[':status'] = $_GET['status'];
    }
    if (!empty($_GET['prioridade'])) {
        $sql .= " AND prioridade = :prioridade";
        $params[':prioridade'] = $_GET['prioridade'];
    }
    if (!empty($_GET['busca'])) {
        $sql .= " AND (titulo LIKE :busca1 OR descricao LIKE :busca2)";
        $termo = '%' . $_GET['busca'] . '%';
        $params[':busca1'] = $termo;
        $params[':busca2'] = $termo;
    }

    $sql .= " ORDER BY
        FIELD(status, 'pendente', 'em_andamento', 'concluida'),
        FIELD(prioridade, 'alta', 'media', 'baixa'),
        data_vencimento IS NULL, data_vencimento ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode($stmt->fetchAll());
}

function criarTarefa($pdo, $dados)
{
    if (empty($dados['titulo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'O título é obrigatório']);
        return;
    }

    $sql = "INSERT INTO tarefas (usuario_id, titulo, descricao, categoria, prioridade, status, data_vencimento)
            VALUES (:usuario_id, :titulo, :descricao, :categoria, :prioridade, :status, :data_vencimento)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':usuario_id' => $_SESSION['usuario_id'],
        ':titulo' => $dados['titulo'],
        ':descricao' => $dados['descricao'] ?? null,
        ':categoria' => !empty($dados['categoria']) ? $dados['categoria'] : 'Geral',
        ':prioridade' => $dados['prioridade'] ?? 'media',
        ':status' => $dados['status'] ?? 'pendente',
        ':data_vencimento' => !empty($dados['data_vencimento']) ? $dados['data_vencimento'] : null,
    ]);

    $id = $pdo->lastInsertId();
    http_response_code(201);
    echo json_encode(buscarTarefa($pdo, $id));
}

function atualizarTarefa($pdo, $dados)
{
    if (empty($dados['id']) || empty($dados['titulo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID e título são obrigatórios']);
        return;
    }

    $sql = "UPDATE tarefas SET
                titulo = :titulo,
                descricao = :descricao,
                categoria = :categoria,
                prioridade = :prioridade,
                status = :status,
                data_vencimento = :data_vencimento
            WHERE id = :id AND usuario_id = :usuario_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':titulo' => $dados['titulo'],
        ':descricao' => $dados['descricao'] ?? null,
        ':categoria' => !empty($dados['categoria']) ? $dados['categoria'] : 'Geral',
        ':prioridade' => $dados['prioridade'] ?? 'media',
        ':status' => $dados['status'] ?? 'pendente',
        ':data_vencimento' => !empty($dados['data_vencimento']) ? $dados['data_vencimento'] : null,
        ':id' => $dados['id'],
        ':usuario_id' => $_SESSION['usuario_id'],
    ]);

    $tarefa = buscarTarefa($pdo, $dados['id']);

    if (!$tarefa) {
        http_response_code(404);
        echo json_encode(['error' => 'Tarefa não encontrada']);
        return;
    }

    echo json_encode($tarefa);
}

function excluirTarefa($pdo)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM tarefas WHERE id = ? AND usuario_id = ?");
    $stmt->execute([$id, $_SESSION['usuario_id']]);

    echo json_encode(['success' => true]);
}

function buscarTarefa($pdo, $id)
{
    $stmt = $pdo->prepare("SELECT * FROM tarefas WHERE id = ? AND usuario_id = ?");
    $stmt->execute([$id, $_SESSION['usuario_id']]);
    return $stmt->fetch();
}
