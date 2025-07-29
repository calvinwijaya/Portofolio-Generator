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

// Generate portfolio template
async function downloadPortofolioTemplate() {
  const mkName = document.getElementById('searchMK').value.trim();
  if (!mkName) {
    alert("Silakan pilih Mata Kuliah terlebih dahulu.");
    return;
  }

  // 1. Download the XLSX file
  const xlsxUrl = 'https://raw.githubusercontent.com/calvinwijaya/Portofolio-Generator/main/Template%20MK.xlsx';
  const docxUrl = 'https://raw.githubusercontent.com/calvinwijaya/Portofolio-Generator/main/Template%20Portofolio.docx';


  const [xlsxBlob, docxBlob] = await Promise.all([
    fetch(xlsxUrl).then(r => r.blob()),
    fetch(docxUrl).then(r => r.blob())
  ]);

  // 2. Read XLSX to find the row for selected MK
  const data = await xlsxBlob.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const mkData = json.find(row => row["Nama Mata Kuliah"] === mkName);
  if (!mkData) {
    alert("Data untuk mata kuliah tidak ditemukan di Excel.");
    return;
  }

  // 3. Replace placeholders in DOCX
  const zip = new PizZip(await docxBlob.arrayBuffer());
  const doc = new window.docxtemplater().loadZip(zip);

  // Format: {Nama Mata Kuliah}, {kode/sks/sifat}, etc.
  const replacements = {};
  Object.keys(mkData).forEach(key => {
    replacements[key.trim()] = mkData[key];
  });

  doc.setOptions({ paragraphLoop: true, linebreaks: true });
  doc.setData(replacements);

  try {
    doc.render();
  } catch (err) {
    console.error("DOCX render error:", err);
    alert("Terjadi kesalahan saat memproses file Word.");
    return;
  }

  const out = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const fileName = `Portofolio ${mkName.replace(/[\\/:*?"<>|]/g, "")}.docx`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(out);
  link.download = fileName;
  link.click();
}

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

  let rows = [["No.", "Deskripsi/PI"]];
  const assessments = document.querySelectorAll(".assessment-row");
  const header = ["No."];
  assessments.forEach(row => {
    const deskripsi = row.children[2].value;
    const pi = row.children[6].value;
    header.push(`${deskripsi}/${pi}`);
  });
  rows[0] = header;

  for (let i = 1; i <= jumlah; i++) {
    rows.push([i, ...Array(assessments.length).fill("")]);
  }

  let csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
  // Get selected MK name
  const mkName = document.getElementById('searchMK').value.trim();
  if (!mkName) {
    alert("Silakan pilih Nama Mata Kuliah terlebih dahulu.");
    return;
  }

  // Ensure generateCPMKPortfolio has been run
  if (!window.usedCPLChartData || !window.usedPIChartData) {
    alert("Silakan generate portofolio CPMK terlebih dahulu.");
    return;
  }

  // Merge CPL + PI data
  const payload = {
    "Nama Mata Kuliah": mkName,
    ...window.usedCPLChartData,
    ...window.usedPIChartData
  };

  console.log("Sending data to sheet:", payload);

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbz5NC_mC3FVwGVde4HK3LUKxzuQNAOrDUVW7fOhxOAv18AZRuxVyNJOjCQR6ax4hcmVRg/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.result === 'success') {
      alert("Data berhasil dikirim ke spreadsheet.");
    } else {
      alert("Gagal mengirim data.");
    }
  } catch (error) {
    console.error("Error sending to sheet:", error);
    alert("Terjadi kesalahan saat mengirim data.");
  }
}
