// main.js

// Sidebar panel
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggle");
    sidebar.classList.toggle("collapsed");
    toggleBtn.innerHTML = sidebar.classList.contains("collapsed") ? "&#x25C0;" : "&#x25B6;";
}

function switchTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId + "Tab").classList.add("active");
    
    if (tabId === 'rekap') {
      loadRekapData(); // auto-refresh when Rekap tab opened
  }
}

// Search Mata Kuliah
let mkList = [];

// Load mata kuliah list from list_mk.txt
fetch('list_mk.txt')
  .then(response => response.text())
  .then(text => {
    mkList = text.split('\n').map(line => line.trim()).filter(Boolean);
  });

// Filter suggestions based on input
function filterMK() {
  const input = document.getElementById('searchMK').value.toLowerCase();
  const suggestionBox = document.getElementById('mkSuggestions');
  suggestionBox.innerHTML = '';

  if (!input) {
    suggestionBox.style.display = 'none';
    return;
  }

  const matched = mkList.filter(mk => mk.toLowerCase().includes(input)).slice(0, 10);

  matched.forEach(mk => {
    const div = document.createElement('div');
    div.textContent = mk;
    div.onclick = () => {
      document.getElementById('searchMK').value = mk;
      suggestionBox.innerHTML = '';
      suggestionBox.style.display = 'none';
    };
    suggestionBox.appendChild(div);
  });

  suggestionBox.style.display = matched.length > 0 ? 'block' : 'none';
}

// // Generate portfolio template
// async function downloadPortofolioTemplate() {
//   const mkName = document.getElementById('searchMK').value.trim();
//   if (!mkName) {
//     alert("Silakan pilih Mata Kuliah terlebih dahulu.");
//     return;
//   }

//   const scriptUrl = 'https://script.google.com/macros/s/AKfycbyaZTwa9BXIuayN_5G2IVfoIbSWSJsac5zJ4ZH9FtZ4_GH3MAtlYcy7mqbT8RXm1JWbXA/exec';

//   try {
//     document.getElementById("loadingOverlay").style.display = "flex";
//     const response = await fetch(`${scriptUrl}?nama=${encodeURIComponent(mkName)}`);
//     const result = await response.json();

//     if (result.status === "NOT_FOUND") {
//       alert("Template Portofolio belum tersedia. RPKPS yang digunakan masih format lama. Silahkan ganti pada format baru dan sampaikan ke Mas Calvin/ Pak Cecep untuk mengupdate di database. Terima kasih.");
//       return;
//     }

//     const byteCharacters = atob(result.base64);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     const blob = new Blob([byteArray], {
//       type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     });

//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = result.name || `Portofolio ${mkName}.docx`;
//     link.click();

//   } catch (err) {
//     console.error("Download error:", err);
//     alert("Gagal mengunduh template portofolio. Silakan coba lagi.");
//   } finally {
//     document.getElementById("loadingOverlay").style.display = "none";
//   }
// }

// Generate CPL buttons A to K
const cplContainer = document.getElementById("cplButtons");
const selectedCPL = new Set();
for (let i = 97; i <= 107; i++) {
  const char = String.fromCharCode(i);
  const btn = document.createElement("button");
  btn.textContent = char;
  btn.classList.add("cpl-button");
  btn.onclick = () => {
    btn.classList.toggle("active");
    if (selectedCPL.has(char)) selectedCPL.delete(char);
    else selectedCPL.add(char);
    updateAssessmentTable();
  };
  cplContainer.appendChild(btn);
}

// Assessment Table
let assessmentCount = 0;
function addAssessmentRow() {
  const jumlahCPMK = parseInt(document.getElementById("jumlahCPMK").value);
  if (!jumlahCPMK || jumlahCPMK < 1) return alert("Isi jumlah CPMK terlebih dahulu!");

  const table = document.getElementById("assessmentRows");
  const row = document.createElement("div");
  row.className = "assessment-row";
  row.dataset.index = assessmentCount;

  // CPMK Dropdown
  const cpmkSelect = document.createElement("select");
  for (let i = 1; i <= jumlahCPMK; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `CPMK ${i}`;
    cpmkSelect.appendChild(opt);
  }

  // Tipe Dropdown
  const tipeSelect = document.createElement("select");
  ["TUGAS", "KUIS", "LAPORAN", "UTS", "UAS", "PROJECT"].forEach(tipe => {
    const opt = document.createElement("option");
    opt.value = tipe;
    opt.textContent = tipe;
    tipeSelect.appendChild(opt);
  });

  // Deskripsi Input
  const deskripsiInput = document.createElement("input");
  deskripsiInput.type = "text";
  deskripsiInput.maxLength = 15;
  deskripsiInput.placeholder = "Deskripsi";

  // Persentase Input
  const persentaseInput = document.createElement("input");
  persentaseInput.type = "number";
  persentaseInput.min = 0;
  persentaseInput.step = 0.01;
  persentaseInput.oninput = validateTotalPercentage;
  persentaseInput.placeholder = "Persentase (%)";

  // Nilai Maksimal Input
  const nilaiMaksInput = document.createElement("input");
  nilaiMaksInput.type = "number";
  nilaiMaksInput.min = 1;
  nilaiMaksInput.placeholder = "Nilai Maks";

  // CPL Dropdown
  const cplSelect = document.createElement("select");
  selectedCPL.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = `CPL ${c}`;
    cplSelect.appendChild(opt);
  });
  cplSelect.onchange = () => updatePIDropdown(row, cplSelect.value);

  // PI Dropdown
  const piSelect = document.createElement("select");

  row.append(cpmkSelect, tipeSelect, deskripsiInput, persentaseInput, nilaiMaksInput, cplSelect, piSelect);
  table.appendChild(row);
  assessmentCount++;
  updatePIDropdown(row, cplSelect.value);
  validateTotalPercentage();
}

function removeAssessmentRow() {
  const table = document.getElementById("assessmentRows");
  if (table.lastChild) table.removeChild(table.lastChild);
  validateTotalPercentage();
}

function updateAssessmentTable() {
  const table = document.getElementById("assessmentRows");
  table.innerHTML = "";
  assessmentCount = 0;
}

function updatePIDropdown(row, cpl) {
  const piSelect = row.querySelector("select:last-child");
  piSelect.innerHTML = "";
  const options = {
    a: ["a1", "a2", "a3"],
    b: ["b1", "b2", "b3", "b4"],
    c: ["c1", "c2", "c3", "c4", "c5"],
    d: ["d1", "d2", "d3"],
    e: ["e1", "e2", "e3", "e4"],
    f: ["f1", "f2"],
    g: ["g1", "g2", "g3", "g4", "g5"],
    h: ["h1", "h2"],
    i: ["i1", "i2"],
    j: ["j1", "j2"],
    k: ["k1", "k2", "k3", "k4"]
  };
  (options[cpl] || []).forEach(pi => {
    const opt = document.createElement("option");
    opt.value = pi;
    opt.textContent = pi;
    piSelect.appendChild(opt);
  });
}

function validateTotalPercentage() {
  const warning = document.getElementById("persentaseWarning");
  const rows = document.querySelectorAll(".assessment-row");
  let total = 0;

  rows.forEach(row => {
    const persentaseInput = row.querySelector("input[placeholder='Persentase (%)']");
    if (persentaseInput) {
      const val = parseFloat(persentaseInput.value);
      if (!isNaN(val)) total += val;
    }
  });

  const roundedTotal = Math.round(total * 100) / 100;

  if (roundedTotal > 100.01) {
    warning.textContent = `Total persentase melebihi 100% (Saat ini: ${roundedTotal}%)`;
    warning.style.color = "red";
  } else if (Math.abs(roundedTotal - 100) < 0.01) {
    warning.textContent = "Total persentase sudah 100%";
    warning.style.color = "green";
  } else {
    warning.textContent = `Total persentase harus 100% (Saat ini: ${roundedTotal}%)`;
    warning.style.color = "red";
  }
}

// Function to generate rencana asesmen template
function saveTemplate() {
  const jumlahCPMK = document.getElementById("jumlahCPMK").value;
  const cplArray = [...selectedCPL];

  const rows = [
    ["JUMLAH_CPMK", jumlahCPMK],
    ["CPL", ...cplArray],
    ["CPMK", "TIPE", "DESKRIPSI", "PERSENTASE", "MAKSIMAL", "CPL", "PI"]
  ];

  const assessmentRows = document.querySelectorAll(".assessment-row");
  assessmentRows.forEach(row => {
    const selects = row.querySelectorAll("select");
    const inputs = row.querySelectorAll("input");
    rows.push([
      selects[0].value,
      selects[1].value,
      inputs[0].value,
      inputs[1].value,
      inputs[2].value,
      selects[2].value,
      selects[3].value
    ]);
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "template_config.csv");
  link.click();
}

function loadTemplate(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split("\n").map(line => line.trim().split(","));

    // Parse jumlah CPMK
    const jumlahCPMK = parseInt(lines[0][1]);
    document.getElementById("jumlahCPMK").value = jumlahCPMK;

    // Parse CPL
    selectedCPL.clear();
    document.querySelectorAll(".cpl-button").forEach(btn => {
      if (lines[1].includes(btn.textContent)) {
        btn.classList.add("active");
        selectedCPL.add(btn.textContent);
      } else {
        btn.classList.remove("active");
      }
    });

    updateAssessmentTable(); // Clear assessment rows
    for (let i = 3; i < lines.length; i++) {
      const [cpmk, tipe, deskripsi, persentase, maksimal, cpl, pi] = lines[i];
      addAssessmentRow(); // Create a new row
      const row = document.querySelectorAll(".assessment-row")[i - 3];
      const selects = row.querySelectorAll("select");
      const inputs = row.querySelectorAll("input");

      selects[0].value = cpmk;
      selects[1].value = tipe;
      inputs[0].value = deskripsi;
      inputs[1].value = persentase;
      inputs[2].value = maksimal;
      selects[2].value = cpl;
      updatePIDropdown(row, cpl);
      selects[3].value = pi;
    }

    validateTotalPercentage();
  };

  reader.readAsText(file);
}

// Function to generate CSV template
function generateCSVTemplate() {
  const jumlah = parseInt(document.getElementById("jumlahMahasiswa").value);
  if (!jumlah || jumlah < 1) return alert("Masukkan jumlah mahasiswa terlebih dahulu!");

  const assessments = document.querySelectorAll(".assessment-row");

  // Build header: No, NIM, Nama, then each Deskripsi/PI
  const header = ["No.", "NIM", "Nama"];
  assessments.forEach(row => {
    const deskripsi = row.children[2].value.trim() || "Deskripsi";
    const pi = row.children[6].value.trim() || "PI";
    header.push(`${deskripsi}/${pi}`);
  });

  // Build rows: No, NIM, Nama, then empty values
  const rows = [header];
  for (let i = 1; i <= jumlah; i++) {
    rows.push([i, "", "", ...Array(assessments.length).fill("")]);
  }

  // Convert to CSV format
  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Trigger download
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "template_nilai.csv");
  link.click();
}

// Function to handle CSV upload notification
document.getElementById('csvUpload').addEventListener('change', function () {
  const file = this.files[0];
  if (file && file.name.endsWith('.csv')) {
    document.getElementById('uploadStatus').innerHTML = '<span style="color: green; font-weight: bold;">Nilai berhasil diupload!</span>';
  } else {
    document.getElementById('uploadStatus').innerHTML = '<span style="color: red; font-weight: bold;">Format file tidak valid!</span>';
  }
});

// Function to generate CPMK portfolio
function generateCPMKPortfolio() {
  const fileInput = document.getElementById('csvUpload');
  const file = fileInput.files[0];
  if (!file) {
    alert('Silakan upload file CSV terlebih dahulu.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const csv = e.target.result;
    const lines = csv.split('\n').filter(Boolean).map(line => line.split(','));
    const headers = lines[0].slice(1).map(h => h.trim()); // Skip "No."

    const scores = lines.slice(1).map(row => row.slice(1).map(cell => parseFloat(cell.trim())));

    // Step 1: Build CPMK assessment map
    const rows = document.querySelectorAll('#assessmentRows > div');
    const cpmkMap = {}; // { CPMK 1: [{label, max, persentase}], ... }

    rows.forEach(row => {
      const selects = row.querySelectorAll('select');
      const inputs = row.querySelectorAll('input');
      const cpmk = selects[0].value;
      const label = inputs[0].value.trim() + '/' + selects[3].value.trim();
      const maxScore = parseFloat(inputs[2].value);  // Nilai Maksimal
      const persentase = parseFloat(inputs[1].value); // Persentase

      if (!cpmkMap[cpmk]) cpmkMap[cpmk] = [];
      cpmkMap[cpmk].push({ label, max: maxScore, persentase });
    });

    const cpmkList = Object.keys(cpmkMap);
    const resultRows = [];
    const performanceData = [];

    // Step 2: Compute average per CPMK
    cpmkList.forEach(cpmk => {
      const items = cpmkMap[cpmk];
      const studentSums = Array(scores.length).fill(0);
      const counts = Array(scores.length).fill(0);

      items.forEach(({ label, max }) => {
        const colIndex = headers.findIndex(h => h === label);
        if (colIndex === -1) {
          console.warn(`Label "${label}" not found. CSV headers:`, headers);
          return;
        }

        scores.forEach((row, i) => {
          const score = row[colIndex];
          if (!isNaN(score)) {
            studentSums[i] += (score / max) * 100;  // ✅ normalize by nilai maksimal
            counts[i]++;
          }
        });
      });

      let total = 0;
      let validStudents = 0;
      studentSums.forEach((sum, i) => {
        if (counts[i] > 0) {
          total += sum / counts[i];  // ✅ average of normalized scores for each student
          validStudents++;
        }
      });

      const avg = validStudents > 0 ? total / validStudents : 0;
      const evaluasi = avg < 60 ? 'Kurang' : avg < 70 ? 'Cukup' : avg < 80 ? 'Baik' : 'Sangat Baik';
      const persentase = items.reduce((sum, item) => sum + (item.persentase || 0), 0);

      resultRows.push({
        cpmk,
        persentase: persentase.toFixed(2),
        standar: 70,
        capaian: avg.toFixed(2),
        evaluasi
      });

      performanceData.push({
        label: cpmk,
        capaian: avg.toFixed(2),
        standar: 70
      });
    });

    window.cpmkData = resultRows;

    // Step 3: Render Table
    const tableHtml = `
      <table border="1" cellpadding="4" cellspacing="0">
        <tr><th>CPMK</th><th>Persentase</th><th>Standar</th><th>Performance</th><th>Evaluasi</th></tr>
        ${resultRows.map(r => `
          <tr>
            <td>${r.cpmk}</td>
            <td>${r.persentase}</td>
            <td>${r.standar}</td>
            <td>${r.capaian}</td>
            <td>${r.evaluasi}</td>
          </tr>`).join('')}
      </table>
    `;
    document.getElementById('cpmkPerformance').innerHTML = `<h3>Capaian CPMK</h3>${tableHtml}`;

    // Step 4: Render Chart
    const ctx = document.getElementById('cpmkChart').getContext('2d');
    if (window.cpmkChart instanceof Chart) {
      window.cpmkChart.destroy();
    }
    window.cpmkChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: performanceData.map(d => d.label),
        datasets: [
          {
            label: 'Standar',
            data: performanceData.map(() => 70), // Flat line at 70
            type: 'line',
            borderColor: 'gold',
            borderWidth: 4,
            borderDash: [7, 5],
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Capaian',
            data: performanceData.map(d => d.capaian),
            backgroundColor: 'rgba(144,238,144,0.6)',
            barPercentage: 0.5,
            categoryPercentage: 1.0
          },
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: ['CPMK Performance (of 100%)', 'Pengukuran capaian per CPMK'],
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    // Step 5: Generate CPL Portfolio
    const cplMap = {};  // { h: [{label, max}], k: [...] }

    rows.forEach(row => {
      const selects = row.querySelectorAll('select');
      const inputs = row.querySelectorAll('input');

      const label = inputs[0].value.trim() + '/' + selects[3].value.trim(); // deskripsi/pi
      const max = parseFloat(inputs[2].value); // Nilai Maksimal
      const cpl = selects[2].value; // CPL selection

      if (!cplMap[cpl]) cplMap[cpl] = [];
      cplMap[cpl].push({ label, max });
    });

    const cplResultRows = [];
    window.usedCPLChartData = {};
    const usedCPLChartData = window.usedCPLChartData;

    Object.entries(cplMap).forEach(([cpl, items]) => {
      const studentSums = Array(scores.length).fill(0);
      const counts = Array(scores.length).fill(0);

      items.forEach(({ label, max }) => {
        const colIndex = headers.findIndex(h => h === label);
        if (colIndex === -1) return;

        scores.forEach((row, i) => {
          const score = row[colIndex];
          if (!isNaN(score)) {
            studentSums[i] += (score / max) * 100;
            counts[i]++;
          }
        });
      });

      let total = 0;
      let validStudents = 0;

      studentSums.forEach((sum, i) => {
        if (counts[i] > 0) {
          total += sum / counts[i];
          validStudents++;
        }
      });

      const avg = validStudents > 0 ? total / validStudents : 0;

      cplResultRows.push({ cpl, capaian: avg.toFixed(2) });
      usedCPLChartData[cpl] = avg.toFixed(2);
    });

    window.cplData = cplResultRows;

    const cplTableHtml = `
      <h3>Capaian CPL</h3>
      <table border="1" cellpadding="4" cellspacing="0">
        <tr><th>CPL</th><th>Performance</th></tr>
        ${cplResultRows.map(r => `
          <tr>
            <td>${r.cpl}</td>
            <td>${r.capaian}</td>
          </tr>`).join('')}
      </table>
    `;
    document.getElementById('cplPerformance').innerHTML = cplTableHtml;
    window.cplTableHtml = cplTableHtml;

    const allCPLs = ['a','b','c','d','e','f','g','h','i','j','k'];
    const cplChartData = allCPLs.map(cpl => ({
      label: `CPL ${cpl}`,
      capaian: usedCPLChartData[cpl] || 0
    }));
    
    const cplCtx = document.getElementById('cplChart').getContext('2d');
    if (window.cplChart instanceof Chart) {
      window.cplChart.destroy();
    }
    window.cplChart = new Chart(cplCtx, {
      type: 'bar',
      data: {
        labels: cplChartData.map(d => d.label),
        datasets: [
          {
            label: 'Standar',
            data: cplChartData.map(() => 70),
            type: 'line',
            borderColor: 'gold',
            borderWidth: 4,
            borderDash: [7, 5],
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Capaian',
            data: cplChartData.map(d => d.capaian),
            backgroundColor: 'rgba(100,149,237,0.7)',
            barPercentage: 0.5,
            categoryPercentage: 1.0
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: ['CPL Performance (of 100%)', 'Pengukuran capaian per CPL'],
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        responsive: true,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Performance'
            },
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    // Step 6: Generate PI Portfolio
    const allPIs = [
      "a1", "a2", "a3",
      "b1", "b2", "b3", "b4",
      "c1", "c2", "c3", "c4", "c5",
      "d1", "d2", "d3",
      "e1", "e2", "e3", "e4",
      "f1", "f2",
      "g1", "g2", "g3", "g4", "g5",
      "h1", "h2",
      "i1", "i2",
      "j1", "j2",
      "k1", "k2", "k3", "k4"
    ];

    const piMap = {};  // { a1: [{label, max}], ... }

    rows.forEach(row => {
      const selects = row.querySelectorAll('select');
      const inputs = row.querySelectorAll('input');

      const label = inputs[0].value.trim() + '/' + selects[3].value.trim();
      const max = parseFloat(inputs[2].value);
      const pi = selects[3].value; // PI is the 4th select

      if (!piMap[pi]) piMap[pi] = [];
      piMap[pi].push({ label, max });
    });

    const piResultRows = [];
    window.usedPIChartData = {};
    const usedPIChartData = window.usedPIChartData;

    Object.entries(piMap).forEach(([pi, items]) => {
      const studentSums = Array(scores.length).fill(0);
      const counts = Array(scores.length).fill(0);

      items.forEach(({ label, max }) => {
        const colIndex = headers.findIndex(h => h === label);
        if (colIndex === -1) return;

        scores.forEach((row, i) => {
          const score = row[colIndex];
          if (!isNaN(score)) {
            studentSums[i] += (score / max) * 100;
            counts[i]++;
          }
        });
      });

      let total = 0;
      let validStudents = 0;
      studentSums.forEach((sum, i) => {
        if (counts[i] > 0) {
          total += sum / counts[i];
          validStudents++;
        }
      });

      const avg = validStudents > 0 ? total / validStudents : 0;

      piResultRows.push({ pi, capaian: avg.toFixed(2) });
      usedPIChartData[pi] = avg.toFixed(2);
    });

    window.piData = piResultRows;
    window.piMap = piMap;

    const piTableHtml = `
      <h3>Capaian PI</h3>
      <table border="1" cellpadding="4" cellspacing="0">
        <tr><th>PI</th><th>Performance</th></tr>
        ${piResultRows.map(r => `
          <tr>
            <td>${r.pi}</td>
            <td>${r.capaian}</td>
          </tr>`).join('')}
      </table>
    `;
    document.getElementById('piPerformance').innerHTML = piTableHtml;
    window.piTableHtml = piTableHtml;
    
    const piChartData = allPIs.map(pi => ({
      label: pi,
      capaian: usedPIChartData[pi] || 0
    }));

    const piCtx = document.getElementById('piChart').getContext('2d');
    if (window.piChart instanceof Chart) {
      window.piChart.destroy();
    }
    window.piChart = new Chart(piCtx, {
      type: 'bar',
      data: {
        labels: piChartData.map(d => d.label),
        datasets: [
          {
            label: 'Standar',
            data: piChartData.map(() => 70),
            type: 'line',
            borderColor: 'gold',
            borderWidth: 4,
            borderDash: [7, 5],
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Capaian',
            data: piChartData.map(d => d.capaian),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            barPercentage: 0.5,
            categoryPercentage: 1.0
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: ['PI Performance (of 100%)', 'Pengukuran capaian per PI'],
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        responsive: true,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Performance'
            },
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  };
  reader.readAsText(file);
}

// Send data to Google Sheets
async function sendToSheet() {
  const mkName = document.getElementById('searchMK').value.trim();
  const kelas = document.getElementById('kelas').value.trim();
  if (!mkName) {
    alert("Silakan pilih Nama Mata Kuliah terlebih dahulu.");
    return;
  }

  if (!window.usedCPLChartData || !window.usedPIChartData) {
    alert("Silakan generate portofolio CPMK terlebih dahulu.");
    return;
  }

  const payload = {
    "Nama Mata Kuliah": mkName,
    "Kelas": kelas,
    ...window.usedCPLChartData,
    ...window.usedPIChartData
  };

  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwuHgayBDBz3NJmsh31duodYksNJSP0F_wWaKwMfyIVDe3O_Kb6AVTHoF4ikSly1WBOZQ/exec",
      {
        method: "POST",
        body: formData
        // NO custom headers!
      }
    );

    const result = await response.json();
    if (result.result === "success") {
      alert("Data berhasil dikirim ke spreadsheet!");
    } else {
      alert("Gagal mengirim data: " + result.message);
    }
  } catch (err) {
    console.error("Error sending to sheet:", err);
    alert("Terjadi kesalahan saat mengirim data.");
  } finally {
    // Hide loading
    document.getElementById("loadingOverlay").style.display = "none";
  }
}

// Send PI score per student to Google Sheets
async function sendMahasiswaNilai() {
  const fileInput = document.getElementById('csvUpload');
  const file = fileInput.files[0];
  const mkName = document.getElementById('searchMK').value.trim();
  const kelas = document.getElementById('kelas').value.trim();

  if (!file) return alert("Silakan upload file CSV terlebih dahulu.");
  if (!mkName || !kelas) return alert("Silakan isi Mata Kuliah dan Kelas terlebih dahulu.");

  const reader = new FileReader();

  reader.onload = async function (e) {
    const csv = e.target.result;
    const lines = csv.split('\n').filter(Boolean).map(line => line.split(',').map(cell => cell.trim()));
    const headers = lines[0];
    const dataRows = lines.slice(1);

    const piHeaders = headers.slice(3); // Deskripsi/PI starts from index 3
    const piMap = window.piMap; // from assessment table
    if (!piMap) {
      alert("Silakan generate CPMK Portofolio terlebih dahulu.");
      return;
    }

    const studentData = dataRows.map(row => {
      const nim = row[1];
      const nama = row[2];
      const piScores = row.slice(3).map(s => parseFloat(s));
      const piData = {};

      // Mapping headers to scores
      const scoreMap = {};
      piHeaders.forEach((h, i) => {
        scoreMap[h] = piScores[i];
      });

      // Aggregate scores per PI using normalization
      Object.entries(piMap).forEach(([pi, items]) => {
        let total = 0, count = 0;

        items.forEach(({ label, max }) => {
          const rawScore = scoreMap[label];
          if (!isNaN(rawScore)) {
            total += (rawScore / max) * 100;
            count++;
          }
        });

        piData[pi] = count > 0 ? (total / count).toFixed(2) : "";
      });

      return {
        "Nama Mata Kuliah": mkName,
        "Kelas": kelas,
        "NIM": nim,
        "Nama": nama,
        ...piData
      };
    });

    document.getElementById("loadingOverlay").style.display = "flex";

    for (const student of studentData) {
      const formData = new FormData();
      formData.append("data", JSON.stringify(student));

      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwpIhkQlRcUBohuuMokKuW3y0wgJ7WaJH_TVP963D3-R2Jb_gbygE_oJU9nv7ARytc/exec", {
          method: "POST",
          body: formData
        });

        const result = await response.json();
        if (result.result !== "success") {
          console.warn(`Gagal kirim untuk ${student.NIM}: ${result.message}`);
        }
      } catch (err) {
        console.error(`Error kirim data ${student.NIM}:`, err);
      }
    }

    document.getElementById("loadingOverlay").style.display = "none";
    alert("Data nilai mahasiswa berhasil dikirim!");
  };

  reader.readAsText(file);
}

// Load rekap data from Google Sheets
async function loadRekapData() {
  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzAKL2_QaqkkDiFx27eEUQWQgrZ6FCY6y7zbeLUkUpWON3NyrcrP7G06ESeaO4l_okl/exec');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Data kosong atau salah format");

    const rows = data;

    const cplKeys = ['a','b','c','d','e','f','g','h','i','j','k'];
    const piKeys = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'c4', 'c5', 'd1', 'd2', 'd3', 'e1', 'e2', 'e3', 'e4', 'f1', 'f2', 'g1', 'g2', 'g3', 'g4', 'g5', 'h1', 'h2', 'i1', 'i2', 'j1', 'j2','k1', 'k2', 'k3', 'k4'];

    const cplSums = {}, cplCounts = {};
    cplKeys.forEach(k => { cplSums[k] = 0; cplCounts[k] = 0; });

    const piSums = {}, piCounts = {};
    piKeys.forEach(k => { piSums[k] = 0; piCounts[k] = 0; });

    rows.forEach(row => {
      Object.entries(row).forEach(([h, val]) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          if (cplKeys.includes(h)) {
            cplSums[h] += num;
            cplCounts[h]++;
          } else if (piKeys.includes(h)) {
            piSums[h] += num;
            piCounts[h]++;
          }
        }
      });
    });

    const avgCPL = cplKeys.map(k => ({
      label: k.toUpperCase(),
      value: cplCounts[k] ? (cplSums[k] / cplCounts[k]) : 0
    }));

    const avgPI = piKeys.map(k => ({
      label: k.toLowerCase(),
      value: piCounts[k] ? (piSums[k] / piCounts[k]) : 0
    }));

    drawCPLRadarChart(avgCPL);
    drawPIBarChart(avgPI);
    renderCPLTable(rows, 'cplTableContainer');
    renderPITable(rows, 'piTableContainer');

  } catch (err) {
    console.error("Gagal memuat rekap:", err);
    alert("Gagal memuat data rekap. Silakan coba lagi.");
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
}

// Draw rekap data
function drawCPLRadarChart(avgData) {
  const soLabels = avgData.map(d => `CPL ${d.label}`);
  const soValues = avgData.map(d => d.value.toFixed(2));
  const thresholdSO = Array(avgData.length).fill(70);

  const ctx = document.getElementById('soRadarChart').getContext('2d');
  if (window.soRadarChart instanceof Chart) {
    window.soRadarChart.destroy();
  }

  window.soRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: soLabels,
      datasets: [
        {
          label: 'Nilai CPL',
          data: soValues,
          backgroundColor: 'rgba(21, 101, 192, 0.2)',
          borderColor: '#1565c0',
          pointBackgroundColor: '#1565c0',
          fill: true
        },
        {
          label: 'Standar (70)',
          data: thresholdSO,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          grid: { circular: true },
          pointLabels: { font: { size: 12 } }
        }
      }
    }
  });
}

function drawPIBarChart(avgData) {
  const piLabels = avgData.map(d => d.label);
  const piValues = avgData.map(d => d.value.toFixed(2));
  const thresholdPI = Array(piLabels.length).fill(70);

  const ctx = document.getElementById('rekapPiChart').getContext('2d');
  if (window.rekapPiChart instanceof Chart) {
    window.rekapPiChart.destroy();
  }

  window.rekapPiChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: piLabels,
      datasets: [
        {
          label: 'Nilai PI',
          data: piValues,
          backgroundColor: '#2e7d32'
        },
        {
          label: 'Standar (70)',
          data: thresholdPI,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,  
          type: 'line',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          grid: { drawOnChartArea: true }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

function renderCPLTable(rows, containerId) {
  const headers = ['Nama Mata Kuliah', 'Kelas', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  let html = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>';
  });

  html += '</tbody></table>';
  document.getElementById(containerId).innerHTML = html;
}

function renderPITable(rows, containerId) {
  const piKeys = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'c4', 'c5',
    'd1', 'd2', 'd3', 'e1', 'e2', 'e3', 'e4', 'f1', 'f2', 'g1', 'g2', 'g3', 'g4', 'g5',
    'h1', 'h2', 'i1', 'i2', 'j1', 'j2', 'k1', 'k2', 'k3', 'k4'];

  const headers = ['Nama Mata Kuliah', 'Kelas', ...piKeys];
  let html = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>';
  });

  html += '</tbody></table>';
  document.getElementById(containerId).innerHTML = html;
}


// Download and process the portofolio template
async function generateAndDownloadFullPortfolio() {
  const mkName = document.getElementById('searchMK').value.trim();
  const kelas = document.getElementById("kelas").value;
  const evaluasiText = document.getElementById("evaluasi").value.trim();
  const rencanaText = document.getElementById("rencana").value.trim();
  if (!mkName) {
    alert("Silakan pilih Mata Kuliah terlebih dahulu.");
    return;
  }

  const scriptUrl = 'https://script.google.com/macros/s/AKfycbyaZTwa9BXIuayN_5G2IVfoIbSWSJsac5zJ4ZH9FtZ4_GH3MAtlYcy7mqbT8RXm1JWbXA/exec';

  try {
    document.getElementById("loadingOverlay").style.display = "flex";

    const response = await fetch(`${scriptUrl}?nama=${encodeURIComponent(mkName)}`);
    const result = await response.json();

    if (result.status === "NOT_FOUND") {
      alert("Template Portofolio belum tersedia. RPKPS yang digunakan masih format lama. Silahkan ganti pada format baru dan sampaikan ke Mas Calvin/ Pak Cecep untuk mengupdate di database. Terima kasih.");
      return;
    }

    // Decode base64 to binary blob
    const byteCharacters = atob(result.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    // Load DOCX template
    const zip = new PizZip(await blob.arrayBuffer());
    const doc = new window.docxtemplater().loadZip(zip);
    doc.setOptions({
      paragraphLoop: true,
      linebreaks: true,
      parser: (tag) => ({
        get: (scope) => {
          const val = scope[tag];
          if (val && typeof val === 'object') {
            if (val.raw) return {
              value: val.raw,
              toString: () => val.raw, // fallback
            };
            if (val.image) return val.image;
          }
          return val;
        }
      })
    });

    // Prepare data to inject into placeholders
    const tableRows = [];
    const headers = ["CPMK", "Tipe", "Deskripsi", "Persentase", "Nilai Maksimal", "CPL", "PI"];

    document.querySelectorAll("#assessmentRows .assessment-row").forEach(row => {
      const inputs = row.querySelectorAll("input, select");
      const values = Array.from(inputs).map(i => i.value.trim());
      const rowObj = {};
      headers.forEach((key, idx) => {
        rowObj[key.replace(/\s+/g, "")] = values[idx]; // Remove spaces in keys
      });
      tableRows.push(rowObj);
    });

    // Generate HTML table string
    let plainTable = "CPMK\tTipe\tDeskripsi\tPersentase\tNilai Maksimal\tCPL\tPI\n";
    let plainCPMK = "CPMK\tPersentase\tStandar\tPerformance\tEvaluasi\n";
    let plainCPL = "CPL\tPerformance\n";
    let plainPI = "PI\tPerformance\n";

    document.querySelectorAll("#assessmentRows .assessment-row").forEach(row => {
      const inputs = row.querySelectorAll("input, select");
      const values = Array.from(inputs).map(i => i.value.trim());
      plainTable += values.join("\t") + "\n";
    });

    (window.cpmkData || []).forEach(row => {
      plainCPMK += `${row.cpmk}\t${row.persentase}\t${row.standar}\t${row.capaian}\t${row.evaluasi}\n`;
    });

    (window.cplData || []).forEach(row => {
      plainCPL += `${row.cpl}\t${row.capaian}\n`;
    });

    (window.piData || []).forEach(row => {
      plainPI += `${row.pi}\t${row.capaian}\n`;
    });

    const replacements = {
      Kelas: kelas,
      Evaluasi: evaluasiText,
      Rencana: rencanaText,
      Rencana_Asesmen: plainTable,
      Tabel_CPMK: plainCPMK,
      Tabel_CPL: plainCPL,
      Tabel_PI: plainPI,
    };

    doc.setData(replacements);

    try {
      doc.render();
    } catch (error) {
      console.error("Render error:", error);
      alert("Gagal memproses dokumen. Periksa placeholder dalam file Word.");
      return;
    }

    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    const originalName = result.name.replace(/\.[^/.]+$/, "");
    const finalName = `Portofolio ${originalName}.docx`;
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(out);
    link.download = finalName;
    link.click();

  } catch (err) {
    console.error("Download error:", err);
    alert("Gagal mengunduh atau memproses template portofolio.");
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
}

// Function to load student portofolio
function loadStudentPortfolio() {
  const nimInput = document.getElementById("searchNIM").value.trim();
  if (!nimInput) return;

  const studentRows = allMahasiswaData.filter(row => String(row.NIM).trim() === nimInput);
  if (studentRows.length === 0) {
    document.getElementById("studentCourses").innerHTML = `<p>Tidak ditemukan data untuk NIM: ${nimInput}</p>`;
    document.getElementById("studentPiTable").innerHTML = "";
    return;
  }

  const studentName = studentRows[0]["Nama"] || "-";

  // 1. Display Nama and NIM
  let html = `<h3>Informasi Mahasiswa</h3>
              <p><strong>Nama:</strong> ${studentName}</p>
              <p><strong>NIM:</strong> ${nimInput}</p>`;

  // 2. Display Daftar Mata Kuliah
  html += `<h3>Daftar Mata Kuliah</h3><ul>`;
  studentRows.forEach(row => {
    html += `<li><strong>${row["Nama Mata Kuliah"]} (Kelas ${row.Kelas})</strong></li>`;
  });
  html += `</ul>`;
  document.getElementById("studentCourses").innerHTML = html;

  // 3. Draw horizontal PI table
  renderPITable(studentRows, "studentPiTable");

  // 4. Draw PI bar chart with threshold
  const piKeys = [
    'a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'c4', 'c5',
    'd1', 'd2', 'd3', 'e1', 'e2', 'e3', 'e4', 'f1', 'f2', 'g1', 'g2', 'g3', 'g4', 'g5',
    'h1', 'h2', 'i1', 'i2', 'j1', 'j2', 'k1', 'k2', 'k3', 'k4'
  ];

  const avgPI = {};
  const countPI = {};
  piKeys.forEach(key => {
    studentRows.forEach(row => {
      const val = parseFloat(row[key]);
      if (!isNaN(val)) {
        avgPI[key] = (avgPI[key] || 0) + val;
        countPI[key] = (countPI[key] || 0) + 1;
      }
    });
  });

  const avgData = piKeys.map(key => ({
    label: key,
    value: avgPI[key] ? (avgPI[key] / countPI[key]) : 0
  }));

  drawStudentPIChart(avgData);

  const cplData = calculateCPLFromPI(studentRows);
  drawStudentCPLRadarChart(cplData);

  const cplRow = { "Nama Mata Kuliah": "Rata-rata", "Kelas": "-" };
  cplData.forEach(cpl => {
    cplRow[cpl.label] = cpl.value.toFixed(2);
  });
  renderCPLTable([cplRow], "studentCPLTable");
}

function drawStudentCPLRadarChart(avgData) {
  const soLabels = avgData.map(d => `CPL ${d.label}`);
  const soValues = avgData.map(d => d.value.toFixed(2));
  const thresholdSO = Array(avgData.length).fill(70);

  const ctx = document.getElementById('studentCPLChart').getContext('2d');
  if (window.studentCPLChart instanceof Chart) {
    window.studentCPLChart.destroy();
  }

  window.studentCPLChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: soLabels,
      datasets: [
        {
          label: 'Nilai CPL',
          data: soValues,
          backgroundColor: 'rgba(21, 101, 192, 0.2)',
          borderColor: '#1565c0',
          pointBackgroundColor: '#1565c0',
          fill: true
        },
        {
          label: 'Standar (70)',
          data: thresholdSO,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          grid: { circular: true },
          pointLabels: { font: { size: 12 } }
        }
      }
    }
  });
}

function renderCPLTable(rows, containerId) {
  const cplKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  const headers = ['Nama Mata Kuliah', 'Kelas', ...cplKeys];

  let html = '<table border="1" cellpadding="6"><thead><tr>' +
             headers.map(h => `<th>${h}</th>`).join('') +
             '</tr></thead><tbody>';

  // Table rows per course
  rows.forEach(row => {
    html += '<tr>' +
            headers.map(h => `<td>${row[h] || ''}</td>`).join('') +
            '</tr>';
  });

  html += '</tbody></table>';

  document.getElementById(containerId).innerHTML = html;
}

function renderPITable(rows, containerId) {
  const piKeys = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'c4', 'c5',
    'd1', 'd2', 'd3', 'e1', 'e2', 'e3', 'e4', 'f1', 'f2', 'g1', 'g2', 'g3', 'g4', 'g5',
    'h1', 'h2', 'i1', 'i2', 'j1', 'j2', 'k1', 'k2', 'k3', 'k4'];

  const headers = ['Nama Mata Kuliah', 'Kelas', ...piKeys];
  let html = '<table border="1" cellpadding="6"><thead><tr>' +
             headers.map(h => `<th>${h}</th>`).join('') +
             '</tr></thead><tbody>';

  // Table rows per course
  rows.forEach(row => {
    html += '<tr>' +
            headers.map(h => `<td>${row[h] || ''}</td>`).join('') +
            '</tr>';
  });

  // Compute averages
  const piSums = {}, piCounts = {};
  piKeys.forEach(key => { piSums[key] = 0; piCounts[key] = 0; });

  rows.forEach(row => {
    piKeys.forEach(key => {
      const val = parseFloat(row[key]);
      if (!isNaN(val)) {
        piSums[key] += val;
        piCounts[key]++;
      }
    });
  });

  const avgRow = ['<strong>Rata-rata</strong>', ''];
  piKeys.forEach(key => {
    const avg = piCounts[key] > 0 ? (piSums[key] / piCounts[key]).toFixed(2) : '';
    avgRow.push(`<strong>${avg}</strong>`);
  });

  html += '<tr>' + avgRow.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
  html += '</tbody></table>';

  document.getElementById(containerId).innerHTML = html;
}

function drawStudentPIChart(avgData) {
  const labels = avgData.map(d => d.label);
  const values = avgData.map(d => d.value.toFixed(2));
  const threshold = Array(labels.length).fill(70);

  const ctx = document.getElementById('studentPiChart').getContext('2d');
  if (window.studentPiChart instanceof Chart) {
    window.studentPiChart.destroy();
  }

  window.studentPiChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Nilai PI',
          data: values,
          backgroundColor: '#3f51b5'
        },
        {
          label: 'Standar (70)',
          data: threshold,
          type: 'line',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 10 },
          grid: { drawOnChartArea: true }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

function calculateCPLFromPI(studentRows) {
  const piToCplMap = {
    a: ['a1', 'a2', 'a3'],
    b: ['b1', 'b2', 'b3', 'b4'],
    c: ['c1', 'c2', 'c3', 'c4', 'c5'],
    d: ['d1', 'd2', 'd3'],
    e: ['e1', 'e2', 'e3', 'e4'],
    f: ['f1', 'f2'],
    g: ['g1', 'g2', 'g3', 'g4', 'g5'],
    h: ['h1', 'h2'],
    i: ['i1', 'i2'],
    j: ['j1', 'j2'],
    k: ['k1', 'k2', 'k3', 'k4']
  };

  const cplSums = {}, cplCounts = {};
  Object.keys(piToCplMap).forEach(cpl => {
    cplSums[cpl] = 0;
    cplCounts[cpl] = 0;
  });

  studentRows.forEach(row => {
    Object.entries(piToCplMap).forEach(([cpl, pis]) => {
      pis.forEach(pi => {
        const val = parseFloat(row[pi]);
        if (!isNaN(val)) {
          cplSums[cpl] += val;
          cplCounts[cpl]++;
        }
      });
    });
  });

  return Object.keys(piToCplMap).map(cpl => ({
    label: cpl,
    value: cplCounts[cpl] > 0 ? cplSums[cpl] / cplCounts[cpl] : 0
  }));
}

// Function to filter Mahasiswa
let allMahasiswaData = [];

async function filterMahasiswa() {
  const nimInputField = document.getElementById("searchNIM");
  if (!nimInputField) return;

  const input = nimInputField.value.trim().toLowerCase();
  const suggestionBox = document.getElementById("nimSuggestions");
  if (!suggestionBox) return;

  suggestionBox.innerHTML = "";

  if (allMahasiswaData.length === 0) {
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxgaO9USl8PjDnBE6ZuvZCUTWrUY__gXR9KI73dmw46viBufV4SA_81arGQQb0TWWLx/exec");
      allMahasiswaData = await response.json();
    } catch (error) {
      console.error("Gagal fetch data mahasiswa:", error);
      suggestionBox.innerHTML = `<div style="color:red;">Gagal memuat data</div>`;
      return;
    }
  }

  if (!input) {
    suggestionBox.style.display = "none";
    return;
  }

  const uniqueMahasiswaMap = new Map();
  allMahasiswaData.forEach(row => {
    const nim = String(row.NIM).trim().toLowerCase();
    if (!uniqueMahasiswaMap.has(nim)) {
      uniqueMahasiswaMap.set(nim, row); 
    }
  });

  const matched = Array.from(uniqueMahasiswaMap.values())
    .filter(row => {
      const nim = String(row.NIM).toLowerCase();
      const nama = String(row.Nama || "").toLowerCase();
      return nim.includes(input) || nama.includes(input);
    })
    .slice(0, 10);

  matched.forEach(row => {
    const div = document.createElement("div");
    div.textContent = `${row.NIM} - ${row.Nama}`;
    div.className = "suggestion-item";
    div.onclick = () => {
      nimInputField.value = row.NIM;
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
    };
    suggestionBox.appendChild(div);
  });

  suggestionBox.style.display = matched.length > 0 ? "block" : "none";
}