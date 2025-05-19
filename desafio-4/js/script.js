const estados = {
    21: "Maranhão",
    22: "Piauí",
    23: "Ceará",
    25: "Paraíba",
    26: "Pernambuco",
    29: "Bahia",
    31: "Minas Gerais",
    33: "Rio de Janeiro",
    35: "São Paulo"
  };
  
  const ctx = document.getElementById("grafico").getContext("2d");
  let chart;
  
  function criarBotoes() {
    const container = document.getElementById("botoesEstados");
    for (const [codigo, nome] of Object.entries(estados)) {
      const btn = document.createElement("button");
      btn.textContent = nome;
      btn.onclick = () => carregarDados(codigo, nome);
      container.appendChild(btn);
    }
  }
  
  function carregarDados(codEstado, nomeEstado) {
    fetch(`https://simcaq.c3sl.ufpr.br/api/v1/enrollment?filter=state:${codEstado}`)
      .then(res => res.json())
      .then(dados => {
        const resultado = dados.result;
  
        // Agrupamento: ano > etapa > total
        const agrupado = {};
        resultado.forEach(item => {
          const ano = item.year;
          const etapa = item.school_year_name;
          if (!agrupado[etapa]) agrupado[etapa] = {};
          agrupado[etapa][ano] = (agrupado[etapa][ano] || 0) + item.total;
        });
  
        const anos = [...new Set(resultado.map(item => item.year))].sort();
  
        const datasets = Object.entries(agrupado).map(([etapa, dadosAno], i) => {
          const cores = ["#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236", "#166a8f", "#00a950", "#58595b"];
          return {
            label: etapa,
            data: anos.map(ano => dadosAno[ano] || 0),
            backgroundColor: cores[i % cores.length],
            stack: "Stack 0"
          };
        });
  
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: anos,
            datasets: datasets
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Matrículas por Etapa e Ano - ${nomeEstado}`
              },
              tooltip: {
                mode: "index",
                intersect: false
              },
              legend: {
                position: "top"
              }
            },
            scales: {
              x: { stacked: true },
              y: {
                stacked: true,
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Total de Matrículas"
                }
              }
            }
          }
        });
      })
      .catch(err => console.error("Erro ao carregar dados:", err));
  }
  
  criarBotoes();
  carregarDados(21, "Maranhão"); // Carrega estado padrão

  // Função pra exportar Dasboard como imagem
  function exportarImagem() {
  const link = document.createElement('a');
  link.download = 'grafico.png';
  link.href = document.getElementById('grafico').toDataURL('image/png', 1.0);
  link.click();
}
  document.getElementById('exportar').addEventListener('click', exportarImagem);
  
  document.getElementById('exportar').addEventListener('click', exportarImagem);

  // Função para exportar o gráfico PDF

  function exportarPDF() {
  const canvas = document.getElementById('grafico');
  const imageData = canvas.toDataURL('image/png', 1.0);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('grafico.pdf');
}
  document.getElementById('exportar-pdf').addEventListener('click', exportarPDF);



