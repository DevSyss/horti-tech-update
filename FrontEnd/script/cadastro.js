
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("authForm");
    const cpfInput = document.getElementById("cpf");

    if (!formCadastro || !cpfInput) {
        console.error("Formulário ou campo CPF não encontrado.");
        return;
    }

    // Máscara de CPF
    cpfInput.addEventListener("input", (event) => {
        let valor = event.target.value
            .replace(/\D/g, "")
            .slice(0, 11);

        if (valor.length > 9) {
            valor = valor.replace(
                /^(\d{3})(\d{3})(\d{3})(\d{1,2})$/,
                "$1.$2.$3-$4"
            );
        } else if (valor.length > 6) {
            valor = valor.replace(
                /^(\d{3})(\d{3})(\d{1,3})$/,
                "$1.$2.$3"
            );
        } else if (valor.length > 3) {
            valor = valor.replace(
                /^(\d{3})(\d{1,3})$/,
                "$1.$2"
            );
        }

        event.target.value = valor;
    });

    // Cadastro de colaborador
    formCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();

        const colaborador = {
    nome: document.getElementById("nome").value.trim(),
    cpf: document.getElementById("cpf").value.trim(),
    email: document.getElementById("email").value.trim(),
    senha: document.getElementById("senha").value,
    tipo: document.getElementById("tipo").value
        };

        const botao = formCadastro.querySelector(
            'button[type="submit"]'
        );

        try {
            if (botao) {
                botao.disabled = true;
                botao.textContent = "Cadastrando...";
            }

            const resposta = await fetch(
                "http://localhost:8080/api/colaboradores",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(colaborador)
                }
            );

            const texto = await resposta.text();

            if (!resposta.ok) {
                throw new Error(
                    `HTTP ${resposta.status}: ${texto}`
                );
            }

            alert("Colaborador cadastrado com sucesso!");
            formCadastro.reset();
            window.location.href = "login.html";

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            alert("Falha no cadastro:\n" + erro.message);

        } finally {
            if (botao) {
                botao.disabled = false;
                botao.textContent = "Criar conta →";
            }
        }
    });
});
