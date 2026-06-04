// Dispara o carregamento dos dados assim que a estrutura do HTML estiver pronta
document.addEventListener("DOMContentLoaded", () => {
    carregarPontuacaoGeral();      // 1. Gráfico de Barras (graficoTop8)
    carregarListaClassificados();  // 2. Lista de Cards (listaClassificados)
    carregarGraficoPizza();        // 3. Gráfico de Pizza (graficoSaldo)
    carregarAproveitamento();      // 4. Gráfico de Linha (graficoAproveitamento)
});


 // 1. Gráfico: Pontuação Geral Ordenada (Barras)
async function carregarPontuacaoGeral() {
    try {
        const resposta = await fetch("http://localhost:3000/top8");
        const dados = await resposta.json();

        const nomes = dados.map(time => time.nome);
        const pontos = dados.map(time => time.pontos);

        const ctx = document.getElementById("graficoTop8");
        if (!ctx) return;

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: nomes,
                datasets: [{
                    label: "Pontos Ganhos",
                    data: pontos,
                    backgroundColor: "#10b981",
                    borderColor: "#059669",
                    borderWidth: 1
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false 
            }
        });
    } catch (erro) {
        console.error("Erro ao carregar pontuação geral:", erro);
    }
}


 //2- Lista do Top 8 com Cards
async function carregarListaClassificados() {
    try {
        const resposta = await fetch("http://localhost:3000/top8");
        const dados = await resposta.json();

        const lista = document.getElementById("listaClassificados");
        if (!lista) return;

        lista.innerHTML = "";

        dados.forEach((time, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="card-posicao">${index + 1}°</div>
                <div class="card-nome">${time.nome}</div>
                <div class="card-pontos">${time.pontos} Pts</div>
            `;
            lista.appendChild(li);
        });
    } catch (erro) {
        console.error("Erro ao carregar lista de classificados:", erro);
    }
}


 // 3 Gráfico - Proporção do Saldo de Gols Geral (Pizza)
async function carregarGraficoPizza() {
    try {
        const resposta = await fetch("http://localhost:3000/saldo");
        const dados = await resposta.json();

        const nomes = dados.map(time => time.nome);
        const saldos = dados.map(time => Math.abs(time.saldo)); 

        const ctx = document.getElementById("graficoSaldo");
        if (!ctx) return;

        const coresFatias = dados.map((_, i) => `hsl(${(i * 360) / dados.length}, 65%, 55%)`);

        new Chart(ctx, {
            type: "pie",
            data: {
                labels: nomes,
                datasets: [{
                    data: saldos,
                    backgroundColor: coresFatias,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'bottom', 
                        labels: { font: { family: 'Poppins' } } 
                    }
                }
            }
        });
    } catch (erro) {
        console.error("Erro ao carregar gráfico de pizza:", erro);
    }
}


 // 4. Gráfico: Percentual de Desempenho e Aproveitamento (Linha)
async function carregarAproveitamento() {
    try {
        const resposta = await fetch("http://localhost:3000/aproveitamento");
        const dados = await resposta.json();

        const nomes = dados.map(time => time.nome);
        const aproveitamento = dados.map(time => parseFloat(time.aproveitamento ?? time.percentual));

        const ctx = document.getElementById("graficoAproveitamento");
        if (!ctx) return;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: nomes,
                datasets: [{
                    label: "Aproveitamento (%)",
                    data: aproveitamento,
                    backgroundColor: "rgba(139, 92, 246, 0.2)",
                    borderColor: "#8b5cf6",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    y: { beginAtZero: true, max: 100 } 
                }
            }
        });
    } catch (erro) {
        console.error("Erro ao carregar aproveitamento:", erro);
    }
}


 // Barra de Pesquisa
async function buscarTimes() {
    const inputNome = document.getElementById("nomeTime");
    const containerResultado = document.getElementById("resultadoBusca");

    if (!inputNome || !containerResultado) return;

    const termoBusca = inputNome.value.trim().toLowerCase();

    if (termoBusca === "") {
        containerResultado.innerHTML = "<p style='color: #ef4444; font-weight: 500;'>Por favor, digite o nome de um time.</p>";
        containerResultado.style.display = "block";
        return;
    }
    try {
        const [resTop8, resSaldo, resAproveitamento] = await Promise.all([
            fetch("http://localhost:3000/top8"),
            fetch("http://localhost:3000/saldo"),
            fetch("http://localhost:3000/aproveitamento")
        ]);

        const dadosTop8 = await resTop8.json();
        const dadosSaldo = await resSaldo.json();
        const dadosAprov = await resAproveitamento.json();

        const timePontos = dadosTop8.find(time => time.nome.toLowerCase().includes(termoBusca));
        const timeSaldo = dadosSaldo.find(time => time.nome.toLowerCase().includes(termoBusca));
        const timeAprov = dadosAprov.find(time => time.nome.toLowerCase().includes(termoBusca));

        if (timePontos || timeSaldo || timeAprov) {
            const nomeOficial = timePontos ? timePontos.nome : (timeSaldo ? timeSaldo.nome : timeAprov.nome);
            const pontos = timePontos ? `${timePontos.pontos} pts` : "Não informado";
            const saldoGols = timeSaldo ? (timeSaldo.saldo > 0 ? `+${timeSaldo.saldo}` : timeSaldo.saldo) : "Não informado";
            const aproveitamento = timeAprov ? `${timeAprov.aproveitamento ?? timeAprov.percentual}%` : "Não informado";

            containerResultado.innerHTML = `
                <div style="text-align: left;">
                    <h3 style="font-size: 1.4rem; font-weight: 600; color: #1e293b; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                        ⚽ ${nomeOficial}
                    </h3>
                    <p style="margin: 4px 0; color: #475569; font-size: 1rem;">
                        <strong>Pontuação Geral:</strong> <span style="color: #10b981; font-weight: 600;">${pontos}</span>
                    </p>
                    <p style="margin: 4px 0; color: #475569; font-size: 1rem;">
                        <strong>Saldo de Gols:</strong> <span style="color: #3b82f6; font-weight: 600;">${saldoGols}</span>
                    </p>
                    <p style="margin: 4px 0; color: #475569; font-size: 1rem;">
                        <strong>Aproveitamento:</strong> <span style="color: #8b5cf6; font-weight: 600;">${aproveitamento}</span>
                    </p>
                </div>
            `;
            containerResultado.style.display = "block";
        } else {
            containerResultado.innerHTML = `<p style='color: #64748b; font-weight: 500;'>Nenhum time encontrado com o nome "${inputNome.value}".</p>`;
            containerResultado.style.display = "block";
        }
    } catch (erro) {
        console.error("Erro na busca de times:", erro);
        containerResultado.innerHTML = "<p style='color: #ef4444; font-weight: 500;'>Erro ao conectar com o servidor local.</p>";
        containerResultado.style.display = "block";
    }
}
