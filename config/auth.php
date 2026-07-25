<?php
if (!isset($_SESSION)) {
    session_start();
}

function usuarioLogado() {
    if (!empty($_SESSION['usuario_id'])) {
        return true;
    }
    return false;
}

function exigirLogin() {
    if (!usuarioLogado()) {
        header('Location: login.php');
        exit;
    }
}

function exigirLoginApi() {
    if (!usuarioLogado()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Não autenticado. Faça login novamente.']);
        exit;
    }
}
