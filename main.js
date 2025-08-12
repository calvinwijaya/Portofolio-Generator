// Sidebar panel
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggle");
    sidebar.classList.toggle("collapsed");
    toggleBtn.innerHTML = sidebar.classList.contains("collapsed") ? "&#x25C0;" : "&#x25B6;";
}

function switchTab(tabId) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  
  const realTabId = tabId.endsWith("Tab") ? tabId : tabId + "Tab";

  const target = document.getElementById(realTabId);
  if (target) {
    target.classList.add("active");
  } else {
    console.warn("Tab not found:", realTabId);
  }
}

function toggleDropdown(event) {
  const dropdown = event.currentTarget.querySelector(".dropdown-content");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
  event.stopPropagation(); // prevent accidental bubbling
}

// Search Mata Kuliah
let mkList = [];
let selectedJenjang = null; // already set in the jenjang button script

// Function to load MK list based on jenjang
function loadMKList(jenjang) {
  let fileName = "";
  if (jenjang === "S1") fileName = "list_mk_s1.txt";
  else if (jenjang === "S2") fileName = "list_mk_s2.txt";
  else if (jenjang === "S3") fileName = "list_mk_s3.txt";

  if (!fileName) return;

  fetch(fileName)
    .then(response => response.text())
    .then(text => {
      mkList = text.split('\n').map(line => line.trim()).filter(Boolean);
      console.log(`Loaded MK list for ${jenjang}:`, mkList.length, "items");
    })
    .catch(err => console.error(`Failed to load ${fileName}`, err));
}

// Modify jenjang button logic so it reloads MK list
const jenjangContainer = document.getElementById("jenjangButtons");
const jenjangList = ["S1", "S2", "S3"];

jenjangList.forEach(jenjang => {
  const btn = document.createElement("button");
  btn.textContent = jenjang;
  btn.classList.add("jenjang-button"); // different class now
  btn.onclick = () => {
    // Remove active from all jenjang buttons
    document.querySelectorAll("#jenjangButtons .jenjang-button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    selectedJenjang = jenjang;

    loadMKList(selectedJenjang);
    generateCPLButtons(selectedJenjang);
  };
  jenjangContainer.appendChild(btn);
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

// === Jenjang-specific CPL and PI data ===
const jenjangCPLData = {
  S1: {
    cplList: ["a","b","c","d","e","f","g","h","i","j","k"],
    piMap: {
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
    }
  },
  S2: {
    cplList: ["a","b","c","d","e","f","g","h"],
    piMap: {
      a: ["a1", "a2", "a3"],
      b: ["b1", "b2", "b3", "b4"],
      c: ["c1", "c2", "c3"],
      d: ["d1", "d2", "d3", "d4", "d5"],
      e: ["e1", "e2"],
      f: ["f1", "f2", "f3", "f4"],
      g: ["g1", "g2", "g3", "g4", "g5"],
      h: ["h1", "h2", "h3", "h4"]
    }
  },
  S3: {
    cplList: ["a","b","c","d","e","f","g","h"],
    piMap: {
      a: ["a1", "a2"],
      b: ["b1", "b2"],
      c: ["c1", "c2", "c3"],
      d: ["d1", "d2", "d3", "d4"],
      e: ["e1", "e2", "e3", "e4"],
      f: ["f1", "f2", "f3"],
      g: ["g1", "g2", "g3"],
      h: ["h1", "h2", "h3", "h4"]
    }
  }
};

const selectedCPL = new Set();
const cplContainer = document.getElementById("cplButtons");

// === Generate CPL buttons based on selected Jenjang ===
function generateCPLButtons(jenjang) {
  cplContainer.innerHTML = "";
  selectedCPL.clear();

  if (!jenjang || !jenjangCPLData[jenjang]) return;

  jenjangCPLData[jenjang].cplList.forEach(char => {
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
  });
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

// === Update PI dropdown based on CPL & Jenjang ===
function updatePIDropdown(row, cpl) {
  const piSelect = row.querySelector("select:last-child");
  piSelect.innerHTML = "";

  if (!selectedJenjang || !jenjangCPLData[selectedJenjang]) return;

  const options = jenjangCPLData[selectedJenjang].piMap;
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
    ["JENJANG", selectedJenjang || ""], // <-- store jenjang
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

    // Parse Jenjang
    let jenjangFromFile = lines[0][1]?.trim();
    if (jenjangFromFile && jenjangFromFile !== selectedJenjang) {
      selectedJenjang = jenjangFromFile;

      // Highlight Jenjang button after loading
      document.querySelectorAll("#jenjangButtons .jenjang-button").forEach(btn => {
        if (btn.textContent.trim() === selectedJenjang) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Reload MK list and CPL buttons for this jenjang
      loadMKList(selectedJenjang);
      generateCPLButtons(selectedJenjang);
    }

    // Parse jumlah CPMK
    const jumlahCPMK = parseInt(lines[1][1]);
    document.getElementById("jumlahCPMK").value = jumlahCPMK;

    // Parse CPL selection (AFTER generateCPLButtons so highlight is kept)
    selectedCPL.clear();
    document.querySelectorAll(".cpl-button").forEach(btn => {
      if (lines[2].includes(btn.textContent)) {
        btn.classList.add("active");
        selectedCPL.add(btn.textContent);
      } else {
        btn.classList.remove("active");
      }
    });

    // Fill assessment rows
    updateAssessmentTable(); // Clear table
    for (let i = 4; i < lines.length; i++) {
      const [cpmk, tipe, deskripsi, persentase, maksimal, cpl, pi] = lines[i];
      if (!cpmk) continue; // skip empty rows
      addAssessmentRow();
      const row = document.querySelectorAll(".assessment-row")[i - 4];
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
    const cpmkMap = {};

    rows.forEach(row => {
      const selects = row.querySelectorAll('select');
      const inputs = row.querySelectorAll('input');
      const cpmk = selects[0].value;
      const label = inputs[0].value.trim() + '/' + selects[3].value.trim();
      const maxScore = parseFloat(inputs[2].value); 
      const persentase = parseFloat(inputs[1].value);

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
    
    const CPL_MAP = {
      S1: ['a','b','c','d','e','f','g','h','i','j','k'],
      S2: ['a','b','c','d','e','f','g','h'],
      S3: ['a','b','c','d','e','f','g','h']
    };

    const allCPLs = CPL_MAP[selectedJenjang] || [];
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
    const PI_MAP = {
      S1: [
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
      ],
      S2: [
        "a1", "a2", "a3",
        "b1", "b2", "b3", "b4",
        "c1", "c2", "c3",
        "d1", "d2", "d3", "d4", "d5",
        "e1", "e2",
        "f1", "f2", "f3", "f4",
        "g1", "g2", "g3", "g4", "g5",
        "h1", "h2", "h3", "h4"
      ],
      S3: [
        "a1", "a2", 
        "b1", "b2", 
        "c1", "c2", "c3",
        "d1", "d2", "d3", "d4",
        "e1", "e2", "e3", "e4",
        "f1", "f2", "f3",
        "g1", "g2", "g3", 
        "h1", "h2", "h3", "h4"
      ]
    };
    const allPIs = PI_MAP[selectedJenjang] || [];
    const piMap = {}; 

    rows.forEach(row => {
      const selects = row.querySelectorAll('select');
      const inputs = row.querySelectorAll('input');

      const label = inputs[0].value.trim() + '/' + selects[3].value.trim();
      const max = parseFloat(inputs[2].value);
      const pi = selects[3].value; 

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
  const tahun = document.getElementById('tahun').value.trim();
  if (!mkName) {
    alert("Silakan pilih Nama Mata Kuliah terlebih dahulu.");
    return;
  }

  if (!window.usedCPLChartData || !window.usedPIChartData) {
    alert("Silakan generate portofolio CPMK terlebih dahulu.");
    return;
  }

  const payload = {
    "jenjang": selectedJenjang,
    "Nama Mata Kuliah": mkName,
    "Kelas": kelas,
    "Tahun": tahun,
    ...window.usedCPLChartData,
    ...window.usedPIChartData
  };

  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyspyd3xsVS_gAcYx1nOCydU2zy3FLTsVR2CxTf2TBGQ_h0j99mRdWr5lANB5DB2EAXrQ/exec",
      {
        method: "POST",
        body: formData
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

    const piHeaders = headers.slice(3); 
    const piMap = window.piMap; 
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
      formData.append("jenjang", selectedJenjang); // send separately

      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbxlObpWekTF63ZneGh0v4d7l21IktTosmP5huayTZG8kuhzTsHoIIPaPV9uWv904TAo/exec", {
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

// helpers to get ordered keys for a jenjang
function getCPLKeysForJenjang(jenjang) {
  const j = (jenjang && jenjangCPLData[jenjang]) ? jenjang : 'S1';
  return (jenjangCPLData[j].cplList || []).slice();
}

function getPIKeysForJenjang(jenjang) {
  const j = (jenjang && jenjangCPLData[jenjang]) ? jenjang : 'S1';
  const keys = [];
  (jenjangCPLData[j].cplList || []).forEach(cpl => {
    const pis = jenjangCPLData[j].piMap[cpl] || [];
    pis.forEach(p => { if (!keys.includes(p)) keys.push(p); });
  });
  return keys;
}

// Case-insensitive row lookup helper
function getRowValueCaseInsensitive(row, key) {
  if (row == null) return "";
  // direct exact match
  if (row.hasOwnProperty(key)) return row[key];
  const lower = String(key).trim().toLowerCase();
  for (const k of Object.keys(row)) {
    if (String(k).trim().toLowerCase() === lower) return row[k];
  }
  return "";
}

// If jenjang not passed, fallback to the dropdown value in Rekap tab
function normalizeJenjangParam(jenjang) {
  if (jenjang && jenjangCPLData[jenjang]) return jenjang;
  const el = document.getElementById("filterJenjangRekap");
  if (el && el.value && jenjangCPLData[el.value]) return el.value;
  return 'S1';
}

// Load rekap data from Google Sheets
async function filterRekapByJenjangYear() {
  const selectedJenjang = document.getElementById("filterJenjangRekap").value;
  const selectedYear = document.getElementById("filterYear").value;
  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    // call GAS with jenjang param so GAS returns the correct sheet data
    const resp = await fetch(
      `https://script.google.com/macros/s/AKfycby7dUI5Gae0ypEQorj4e9PEzbODkH5EBwAdQLi0pHbfitSCpKVxjuHf4QH6UyugEYSh/exec?jenjang=${encodeURIComponent(selectedJenjang)}`
    );
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) {
      alert("Data kosong atau salah format");
      document.getElementById("rekapContent").style.display = "none";
      return;
    }

    // Filter by Tahun (prefix match, e.g., "2024-1" / "2024-2")
    const filteredRows = data.filter(row => String(row.Tahun || '').startsWith(selectedYear));

    if (filteredRows.length === 0) {
      alert(`Tidak ditemukan data untuk jenjang ${selectedJenjang} tahun ${selectedYear}`);
      document.getElementById("rekapContent").style.display = "none";
      return;
    }

    processAndDisplayRekap(filteredRows, selectedJenjang);
    document.getElementById("rekapContent").style.display = "block";

  } catch (err) {
    console.error("Gagal memuat data rekap:", err);
    alert("Gagal memuat data rekap. Silakan coba lagi.");
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
}

// === main processor (jenjang-aware) ===
function processAndDisplayRekap(rows, jenjang) {
  jenjang = normalizeJenjangParam(jenjang);

  const cplKeys = getCPLKeysForJenjang(jenjang);
  const piKeys = getPIKeysForJenjang(jenjang);

  const cplSums = {}, cplCounts = {};
  cplKeys.forEach(k => { cplSums[k] = 0; cplCounts[k] = 0; });

  const piSums = {}, piCounts = {};
  piKeys.forEach(k => { piSums[k] = 0; piCounts[k] = 0; });

  rows.forEach(row => {
    cplKeys.forEach(k => {
      const raw = getRowValueCaseInsensitive(row, k);
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        cplSums[k] += num;
        cplCounts[k] += 1;
      }
    });
    piKeys.forEach(k => {
      const raw = getRowValueCaseInsensitive(row, k);
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        piSums[k] += num;
        piCounts[k] += 1;
      }
    });
  });

  const avgCPL = cplKeys.map(k => cplCounts[k] ? (cplSums[k] / cplCounts[k]) : 0);
  const avgPI  = piKeys.map(k => piCounts[k] ? (piSums[k] / piCounts[k]) : 0);

  drawCPLRadarChart(cplKeys.map((k, i) => ({ label: k.toUpperCase(), value: avgCPL[i] })));
  drawPIBarChart(piKeys.map((k, i) => ({ label: k.toLowerCase(), value: avgPI[i] })));

  renderCPLTable(rows, 'cplTableContainer', jenjang, avgCPL);
  renderPITable(rows, 'piTableContainer', jenjang, avgPI);
}

// === charts (small numeric fixes so Chart.js receives numbers) ===
function drawCPLRadarChart(avgData) {
  const soLabels = avgData.map(d => `CPL ${d.label}`);
  const soValues = avgData.map(d => Number(Number(d.value || 0).toFixed(2)));
  const thresholdSO = Array(avgData.length).fill(70);

  const ctx = document.getElementById('soRadarChart').getContext('2d');
  if (window.soRadarChart instanceof Chart) window.soRadarChart.destroy();

  window.soRadarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: soLabels,
      datasets: [
        {
          label: 'Standar (70)',
          data: thresholdSO,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        },
         {
          label: 'Nilai CPL',
          data: soValues,
          backgroundColor: 'rgba(21, 101, 192, 0.2)',
          borderColor: '#1565c0',
          pointBackgroundColor: '#1565c0',
          fill: true
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
  const piValues = avgData.map(d => Number(Number(d.value || 0).toFixed(2)));
  const thresholdPI = Array(piLabels.length).fill(70);

  const ctx = document.getElementById('rekapPiChart').getContext('2d');
  if (window.rekapPiChart instanceof Chart) window.rekapPiChart.destroy();

  window.rekapPiChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: piLabels,
      datasets: [
        {
          label: 'Standar (70)',
          data: thresholdPI,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          type: 'line',
          pointRadius: 0
        },
        {
          label: 'Nilai PI',
          data: piValues,
          backgroundColor: '#2e7d32'
        },
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

// === tables (jenjang-aware) ===
function renderCPLTable(rows, containerId, jenjang, avgCPL = []) {
  jenjang = normalizeJenjangParam(jenjang);
  const cplKeys = getCPLKeysForJenjang(jenjang);
  const headers = ['No.', 'Nama Mata Kuliah', 'Kelas', ...cplKeys];

  let sortAsc = true;
  const dataRows = [...rows].map((row, index) => ({ ...row, _originalIndex: index + 1 }));

  function renderTableContent() {
    let html = `
      <div class="card mb-4">
        <div class="card-header bg-success text-white fw-semibold d-flex justify-content-between align-items-center">
          Capaian Profil Lulusan (CPL)
          <button class="btn btn-light btn-sm" id="${containerId}-sortBtn">
            Sort Nama Mata Kuliah ${sortAsc ? "▲" : "▼"}
          </button>
        </div>
        <div class="card-body p-2">
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-sm align-middle">
              <thead>
                <tr>${headers.map(h => `<th class="text-nowrap">${h}</th>`).join('')}</tr>
              </thead>
              <tbody>`;

    dataRows.forEach((row, idx) => {
      html += '<tr>' + headers.map(h => {
        if (h === 'No.') {
          // Number based on current visual order, like a static counter
          return `<td class="text-center">${idx + 1}</td>`;
        }
        if (h === 'Nama Mata Kuliah') {
          return `<td class="text-start">${getRowValueCaseInsensitive(row, h) || ''}</td>`;
        }
        if (h === 'Kelas') {
          return `<td class="text-center">${getRowValueCaseInsensitive(row, h) || ''}</td>`;
        }
        const v = getRowValueCaseInsensitive(row, h);
        return `<td class="text-center">${(v !== undefined && v !== null && v !== '' && !isNaN(v)) ? Number(v).toFixed(2) : ''}</td>`;
      }).join('') + '</tr>';
    });

    html += '</tbody>';

    if (avgCPL.length) {
      html += `<tfoot><tr><td colspan="3" class="fw-bold">Rata-rata</td>` +
        avgCPL.map(v => `<td class="fw-bold text-center">${v.toFixed(2)}</td>`).join('') +
        '</tr></tfoot>';
    }

    html += `</table></div></div></div>`;
    document.getElementById(containerId).innerHTML = html;

    // Sorting by Nama Mata Kuliah
    document.getElementById(`${containerId}-sortBtn`).addEventListener("click", () => {
      sortAsc = !sortAsc;
      dataRows.sort((a, b) => {
        const nameA = (getRowValueCaseInsensitive(a, 'Nama Mata Kuliah') || '').toLowerCase();
        const nameB = (getRowValueCaseInsensitive(b, 'Nama Mata Kuliah') || '').toLowerCase();
        return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
      renderTableContent();
    });
  }

  renderTableContent();
}

function renderPITable(rows, containerId, jenjang, avgPI = []) {
  jenjang = normalizeJenjangParam(jenjang);
  const piKeys = getPIKeysForJenjang(jenjang);
  const headers = ['No.', 'Nama Mata Kuliah', 'Kelas', ...piKeys];

  let sortAsc = true;
  const dataRows = [...rows].map((row, index) => ({ ...row, _originalIndex: index + 1 }));

  function renderTableContent() {
    let html = `
      <div class="card mb-4">
        <div class="card-header bg-primary text-white fw-semibold d-flex justify-content-between align-items-center">
          Performance Indicator (PI)
          <button class="btn btn-light btn-sm" id="${containerId}-sortBtn">
            Sort Nama Mata Kuliah ${sortAsc ? "▲" : "▼"}
          </button>
        </div>
        <div class="card-body p-2">
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-sm align-middle">
              <thead>
                <tr>${headers.map(h => `<th class="text-nowrap">${h}</th>`).join('')}</tr>
              </thead>
              <tbody>`;

    dataRows.forEach((row, idx) => {
      html += '<tr>' + headers.map(h => {
        if (h === 'No.') {
          // Number based on current visual order, like a static counter
          return `<td class="text-center">${idx + 1}</td>`;
        }
        if (h === 'Nama Mata Kuliah') {
          return `<td class="text-start">${getRowValueCaseInsensitive(row, h) || ''}</td>`;
        }
        if (h === 'Kelas') {
          return `<td class="text-center">${getRowValueCaseInsensitive(row, h) || ''}</td>`;
        }
        const v = getRowValueCaseInsensitive(row, h);
        return `<td class="text-center">${(v !== undefined && v !== null && v !== '' && !isNaN(v)) ? Number(v).toFixed(2) : ''}</td>`;
      }).join('') + '</tr>';
    });

    html += '</tbody>';

    if (avgPI.length) {
      html += `<tfoot><tr><td colspan="3" class="fw-bold">Rata-rata</td>` +
        avgPI.map(v => `<td class="fw-bold text-center">${v.toFixed(2)}</td>`).join('') +
        '</tr></tfoot>';
    }

    html += `</table></div></div></div>`;
    document.getElementById(containerId).innerHTML = html;

    // Sorting by Nama Mata Kuliah
    document.getElementById(`${containerId}-sortBtn`).addEventListener("click", () => {
      sortAsc = !sortAsc;
      dataRows.sort((a, b) => {
        const nameA = (getRowValueCaseInsensitive(a, 'Nama Mata Kuliah') || '').toLowerCase();
        const nameB = (getRowValueCaseInsensitive(b, 'Nama Mata Kuliah') || '').toLowerCase();
        return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
      renderTableContent();
    });
  }

  renderTableContent();
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

  const scriptUrl = 'https://script.google.com/macros/s/AKfycbx3xEuyZXJITWiYc-YwfOyo2O_PqUVf9dnywQcPYdHkfujFiEBvWUgiipbPAJ1DxzSTNw/exec';
  const jenjangParam = encodeURIComponent(selectedJenjang || "");

  try {
    document.getElementById("loadingOverlay").style.display = "flex";

    // include jenjang param so Apps Script searches the correct folder
    const response = await fetch(`${scriptUrl}?nama=${encodeURIComponent(mkName)}&jenjang=${jenjangParam}`);
    const result = await response.json();

    if (!result || result.status === "NOT_FOUND") {
      alert("Template Portofolio belum tersedia di folder jenjang yang dipilih. Pastikan template ada di folder S1/S2/S3 sesuai jenjang, atau hubungi admin untuk meng-upload template.");
      return;
    }

    if (result.status === "ERROR") {
      console.error("Apps Script error:", result.message);
      alert("Terjadi kesalahan pada server saat mencari template.");
      return;
    }

    // result should contain at least: name and base64
    if (!result.base64) {
      alert("Template ditemukan tetapi tidak dapat diunduh (tidak ada data).");
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

    // Prepare data to inject into placeholders (your existing code)
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

    // Generate plain table strings (your existing code)
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

    const originalName = (result.name || '').replace(/\.[^/.]+$/, "");
    const finalName = `Portofolio ${originalName} - ${kelas}.docx`;

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
async function loadStudentPortfolio() {
  const nimInput = document.getElementById("searchNIM").value.trim();
  const jenjang = document.getElementById("jenjangSelect").value;
  if (!nimInput) return;

  try {
    document.getElementById("loadingOverlay").style.display = "flex";

    // Fetch from GAS with jenjang & nim
    let studentRows = [];
    try {
      const url = `https://script.google.com/macros/s/AKfycbyHjzC1MI1fWdWDv1BzPdaRNnvT1VfhP_Dj24PT5af66X6xcu91j8564jNHTUTHvI4_ew/exec?jenjang=${encodeURIComponent(jenjang)}&nim=${encodeURIComponent(nimInput)}`;
      const response = await fetch(url);
      const allData = await response.json();
      studentRows = allData;
    } catch (error) {
      console.error("Gagal memuat data mahasiswa:", error);
      document.getElementById("studentCourses").innerHTML = `<p style="color:red;">Gagal memuat data mahasiswa.</p>`;
      return;
    }

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
    let sortAscMK = true;

    function renderMKTable(rows) {
      let tableHtml = `
        <div class="card mb-3 shadow-sm">
          <div class="card-header bg-secondary text-white fw-semibold d-flex justify-content-between align-items-center">
            <span>Daftar Mata Kuliah</span>
            <button class="btn btn-light btn-sm" id="sortMKBtn">
              Sort Nama Mata Kuliah ${sortAscMK ? "▲" : "▼"}
            </button>
          </div>
          <div class="table-responsive">
            <table class="table table-striped table-hover table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th>Nama Mata Kuliah</th>
                  <th>Kelas</th>
                </tr>
              </thead>
              <tbody>
      `;

      rows.forEach(row => {
        tableHtml += `
          <tr>
            <td>${row["Nama Mata Kuliah"]}</td>
            <td>${row.Kelas}</td>
          </tr>
        `;
      });

      tableHtml += `
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.getElementById("studentCourses").innerHTML = tableHtml;

      // Add click event for sorting
      document.getElementById("sortMKBtn").addEventListener("click", () => {
        sortAscMK = !sortAscMK;
        const sortedRows = [...rows].sort((a, b) =>
          sortAscMK
            ? a["Nama Mata Kuliah"].localeCompare(b["Nama Mata Kuliah"])
            : b["Nama Mata Kuliah"].localeCompare(a["Nama Mata Kuliah"])
        );
        renderMKTable(sortedRows);
      });
    }

    // Initial render
    renderMKTable(studentRows);

    // 3. Use jenjang-specific PI keys
    const piKeys = getPIKeysForJenjang(jenjang);

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

    // Render PI table below PI chart
    const piTableRows = studentRows.map(row => {
      const piData = {};
      piKeys.forEach(key => {
        const raw = row[key];
        const val = parseFloat(raw);
        piData[key] = (!isNaN(val) && raw !== '') ? val.toFixed(2) : '';
      });

      return {
        "Nama Mata Kuliah": row["Nama Mata Kuliah"],
        "Kelas": row.Kelas,
        ...piData
      };
    });

    // Append average row at the end
    const piAvgRow = {
      "Nama Mata Kuliah": "Rata-rata",
      "Kelas": "-"
    };
    avgData.forEach(item => {
      piAvgRow[item.label] = !isNaN(item.value) ? item.value.toFixed(2) : '';
    });
    piTableRows.push(piAvgRow);

    // === Render PI Table ===
    renderPIMHSTable(piTableRows, "studentPiTable", piKeys);

    // 4. Use jenjang-specific CPL
    const cplRows = studentRows.map(row => {
      const cplValues = calculateCPLFromPI([row], jenjang); // per MK
      const rowData = { "Nama Mata Kuliah": row["Nama Mata Kuliah"], "Kelas": row["Kelas"] };
      cplValues.forEach(cpl => {
        rowData[cpl.label] = cpl.value.toFixed(2);
      });
      return rowData;
    });

    // Add average row at the end (optional)
    const avgCPLRow = { "Nama Mata Kuliah": "Rata-rata", "Kelas": "-" };
    calculateCPLFromPI(studentRows, jenjang).forEach(cpl => {
      avgCPLRow[cpl.label] = cpl.value.toFixed(2);
    });
    cplRows.push(avgCPLRow);

    // Draw CPL radar chart (average)
    drawStudentCPLRadarChart(calculateCPLFromPI(studentRows, jenjang));

    // Render CPL table
    const cplKeys = getCPLKeysForJenjang(jenjang);
    renderCPLMHSTable(cplRows, "studentCPLTable", cplKeys);

  } catch (error) {
    console.error("Gagal memuat data mahasiswa:", error);
    document.getElementById("studentCourses").innerHTML = `<p style="color:red;">Gagal memuat data mahasiswa.</p>`;
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
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
          label: 'Standar (70)',
          data: thresholdSO,
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Nilai CPL',
          data: soValues,
          backgroundColor: 'rgba(21, 101, 192, 0.2)',
          borderColor: '#1565c0',
          pointBackgroundColor: '#1565c0',
          fill: true
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
          label: 'Standar (70)',
          data: threshold,
          type: 'line',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        },
        {
          label: 'Nilai PI',
          data: values,
          backgroundColor: '#3f51b5'
        },
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

function calculateCPLFromPI(studentRows, jenjang) {
  const piToCplMap = jenjangCPLData[jenjang]?.piMap;
  if (!piToCplMap) return [];

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

// Load and filter mahasiswa data for NIM suggestions
let mahasiswaList = [];

// Load mahasiswa list based on selected jenjang
function loadMahasiswaList() {
    const jenjang = document.getElementById("jenjangSelect").value;
    mahasiswaList = []; // reset

    if (!jenjang) {
        console.warn("Pilih jenjang terlebih dahulu.");
        return;
    }

    let fileName = "";
    if (jenjang === "S1") fileName = "Daftar_MHS.csv";
    else if (jenjang === "S2") fileName = "Daftar_MHS_S2.csv";
    else if (jenjang === "S3") fileName = "Daftar_MHS_S3.csv";

    fetch(fileName)
        .then(response => response.text())
        .then(csvText => {
            const parsed = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true
            });
            mahasiswaList = parsed.data;
        })
        .catch(err => console.error("Gagal memuat daftar mahasiswa:", err));
}

// Filter mahasiswa suggestions
function filterMahasiswa() {
    const input = document.getElementById('searchNIM').value.toLowerCase();
    const suggestionBox = document.getElementById('nimSuggestions');
    suggestionBox.innerHTML = '';

    if (!input || mahasiswaList.length === 0) {
        suggestionBox.style.display = 'none';
        return;
    }

    const matched = mahasiswaList
        .filter(m => m.NIM.toLowerCase().includes(input) || m.Nama.toLowerCase().includes(input))
        .slice(0, 10);

    matched.forEach(m => {
        const div = document.createElement('div');
        div.textContent = `${m.NIM} - ${m.Nama}`;
        div.className = 'suggestion-item';
        div.onclick = () => {
            document.getElementById('searchNIM').value = m.NIM;
            suggestionBox.innerHTML = '';
            suggestionBox.style.display = 'none';
        };
        suggestionBox.appendChild(div);
    });

    suggestionBox.style.display = matched.length > 0 ? 'block' : 'none';
}

function renderCPLMHSTable(rows, containerId, cplKeys) {
  if (!rows || rows.length === 0) {
    document.getElementById(containerId).innerHTML = "<p>Tidak ada data CPL.</p>";
    return;
  }

  let sortAsc = true; // toggle state
  const renderTable = () => {
    // Separate rata-rata row from others
    const mainRows = rows.slice(0, rows.length - 1);
    const avgRow = rows[rows.length - 1];

    let html = `
      <div class="card mb-4">
        <div class="card-header bg-success text-white fw-semibold d-flex justify-content-between align-items-center">
          <span>Capaian Profil Lulusan (CPL)</span>
          <button class="btn btn-light btn-sm" id="${containerId}-sortBtn">
            Sort Nama Mata Kuliah ${sortAsc ? "▲" : "▼"}
          </button>
        </div>
        <div class="card-body p-2">
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-sm text-center align-middle">
              <thead>
                <tr>
                  <th class="text-nowrap">Nama Mata Kuliah</th>
                  <th class="text-nowrap">Kelas</th>`;

    cplKeys.forEach(key => {
      html += `<th>${key}</th>`;
    });

    html += `
                </tr>
              </thead>
              <tbody>`;

    // Render main rows
    mainRows.forEach(row => {
      html += `<tr><td>${row["Nama Mata Kuliah"]}</td><td>${row["Kelas"]}</td>`;
      cplKeys.forEach(key => {
        const val = row[key];
        html += `<td>${(val !== undefined && val !== null && val !== '' && !isNaN(val)) ? Number(val).toFixed(2) : ''}</td>`;
      });
      html += `</tr>`;
    });

    // Render average row last
    html += `<tr class="table-secondary fw-bold"><td>${avgRow["Nama Mata Kuliah"]}</td><td>${avgRow["Kelas"]}</td>`;
    cplKeys.forEach(key => {
      const val = avgRow[key];
      html += `<td>${(val !== undefined && val !== null && val !== '' && !isNaN(val)) ? Number(val).toFixed(2) : ''}</td>`;
    });
    html += `</tr>`;

    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    document.getElementById(containerId).innerHTML = html;

    // Attach click event to sort button
    document.getElementById(`${containerId}-sortBtn`).addEventListener("click", () => {
      sortAsc = !sortAsc;
      mainRows.sort((a, b) => {
        const nameA = a["Nama Mata Kuliah"].toLowerCase();
        const nameB = b["Nama Mata Kuliah"].toLowerCase();
        return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
      rows = [...mainRows, avgRow]; // keep avgRow last
      renderTable(); // re-render after sort
    });
  };

  renderTable();
}

function renderPIMHSTable(rows, containerId, piKeys) {
  if (!rows || rows.length === 0) {
    document.getElementById(containerId).innerHTML = "<p>Tidak ada data PI.</p>";
    return;
  }

  let sortAsc = true; // toggle state
  const renderTable = () => {
    // Separate rata-rata row from others
    const mainRows = rows.slice(0, rows.length - 1);
    const avgRow = rows[rows.length - 1];

    let html = `
      <div class="card mb-4">
        <div class="card-header bg-primary text-white fw-semibold d-flex justify-content-between align-items-center">
          <span>Performance Indicator (PI)</span>
          <button class="btn btn-light btn-sm" id="${containerId}-sortBtn">
            Sort Nama Mata Kuliah ${sortAsc ? "▲" : "▼"}
          </button>
        </div>
        <div class="card-body p-2">
          <div class="table-responsive">
            <table class="table table-bordered table-striped table-sm text-center align-middle">
              <thead>
                <tr>
                  <th class="text-nowrap">Nama Mata Kuliah</th>
                  <th class="text-nowrap">Kelas</th>`;

    piKeys.forEach(key => {
      html += `<th>${key}</th>`;
    });

    html += `
                </tr>
              </thead>
              <tbody>`;

    // Render main rows
    mainRows.forEach(row => {
      html += `<tr><td>${row["Nama Mata Kuliah"]}</td><td>${row["Kelas"]}</td>`;
      piKeys.forEach(key => {
        const val = row[key];
        html += `<td>${(val !== undefined && val !== null && val !== '' && !isNaN(val)) ? Number(val).toFixed(2) : ''}</td>`;
      });
      html += `</tr>`;
    });

    // Render average row last
    html += `<tr class="table-secondary fw-bold"><td>${avgRow["Nama Mata Kuliah"]}</td><td>${avgRow["Kelas"]}</td>`;
    piKeys.forEach(key => {
      const val = avgRow[key];
      html += `<td>${(val !== undefined && val !== null && val !== '' && !isNaN(val)) ? Number(val).toFixed(2) : ''}</td>`;
    });
    html += `</tr>`;

    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    document.getElementById(containerId).innerHTML = html;

    // Attach click event to sort button
    document.getElementById(`${containerId}-sortBtn`).addEventListener("click", () => {
      sortAsc = !sortAsc;
      mainRows.sort((a, b) => {
        const nameA = a["Nama Mata Kuliah"].toLowerCase();
        const nameB = b["Nama Mata Kuliah"].toLowerCase();
        return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
      rows = [...mainRows, avgRow]; // keep avgRow last
      renderTable(); // re-render after sort
    });
  };

  renderTable();
}

// Load and visualize time series CPL Prodi
async function loadTimeProdiPortfolio() {
  const tahunAwal = document.getElementById("tahunAwalProdi").value;
  const tahunAkhir = document.getElementById("tahunAkhirProdi").value;
  const jenjang = document.getElementById("filterJenjangTimeSeries").value;
  const container = document.getElementById("prodiChartContainer");
  container.innerHTML = "";

  if (!tahunAwal || !tahunAkhir || tahunAwal > tahunAkhir) {
    alert("Pastikan tahun awal dan akhir terisi dengan benar.");
    return;
  }

  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const url = `https://script.google.com/macros/s/AKfycby7dUI5Gae0ypEQorj4e9PEzbODkH5EBwAdQLi0pHbfitSCpKVxjuHf4QH6UyugEYSh/exec?jenjang=${encodeURIComponent(jenjang)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) throw new Error("Data kosong atau salah format");

    const allYears = [];
    for (let y = parseInt(tahunAwal); y <= parseInt(tahunAkhir); y++) {
      allYears.push(`${y}-1`, `${y}-2`);
    }

    // Group by year prefix (e.g., "2024" from "2024-1")
    const yearGroups = {}; 
    data.forEach(row => {
      const tahun = String(row.Tahun || '').trim();
      const yearPrefix = tahun.split('-')[0];

      if (parseInt(yearPrefix) >= parseInt(tahunAwal) && parseInt(yearPrefix) <= parseInt(tahunAkhir)) {
        if (!yearGroups[yearPrefix]) yearGroups[yearPrefix] = [];
        yearGroups[yearPrefix].push(row);
      }
    });

    const datasets = [];
    const cplKeys = getCPLKeysForJenjang(jenjang);

    Object.entries(yearGroups).forEach(([year, rows]) => {
      const sums = {}, counts = {};
      cplKeys.forEach(k => { sums[k] = 0; counts[k] = 0; });

      rows.forEach(row => {
        cplKeys.forEach(k => {
          const val = parseFloat(row[k]);
          if (!isNaN(val)) {
            sums[k] += val;
            counts[k]++;
          }
        });
      });

      const values = cplKeys.map(k => counts[k] ? (sums[k] / counts[k]) : 0);
      datasets.push({
        label: `Tahun ${year}`,
        data: values
      });
    });

    drawTimeSeriesBarChart(cplKeys.map(k => k.toUpperCase()), datasets, "prodiChartContainer");

  } catch (err) {
    console.error("Gagal memuat data time series:", err);
    alert("Gagal memuat data. Silakan coba lagi.");
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
}

// Draw multi-series bar chart
function drawTimeSeriesBarChart(labels, datasets, containerId) {
  const ctxId = containerId + "Canvas";
  const canvas = document.createElement("canvas");
  canvas.id = ctxId;
  document.getElementById(containerId).appendChild(canvas);

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)"
  ];

  new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: colors[i % colors.length],
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Time-Series CPL Prodi",
          font: {
            size: 20,
            weight: 'bold'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 }, stacked: false },
      }
    }
  });
}

function filterMK_TS() {
  const input = document.getElementById('pilihMKTS').value.toLowerCase();
  const suggestionBox = document.getElementById('mkSuggestionsTS');
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
      document.getElementById('pilihMKTS').value = mk;
      suggestionBox.innerHTML = '';
      suggestionBox.style.display = 'none';
    };
    suggestionBox.appendChild(div);
  });

  suggestionBox.style.display = matched.length > 0 ? 'block' : 'none';
}

function onJenjangMKChange() {
  const jenjang = document.getElementById("jenjangMKTS").value;
  selectedJenjang = jenjang;
  loadMKList(jenjang); // This updates mkList[]
  document.getElementById("pilihMKTS").value = '';
  document.getElementById("mkSuggestionsTS").innerHTML = '';
}

async function loadTimeMKPortfolio() {
  const jenjang = selectedJenjang;
  const mkInput = document.getElementById("pilihMKTS").value.trim();
  const tahunAwal = document.getElementById("tahunAwalMK").value;
  const tahunAkhir = document.getElementById("tahunAkhirMK").value;
  const container = document.getElementById("mkChartContainer");
  container.innerHTML = "";

  if (!jenjang || !mkInput || !tahunAwal || !tahunAkhir || tahunAwal > tahunAkhir) {
    alert("Mohon lengkapi semua input dengan benar (Jenjang, MK, Tahun).");
    return;
  }

  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const url = `https://script.google.com/macros/s/AKfycby7dUI5Gae0ypEQorj4e9PEzbODkH5EBwAdQLi0pHbfitSCpKVxjuHf4QH6UyugEYSh/exec?jenjang=${encodeURIComponent(jenjang)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Data kosong atau salah format");

    const allYears = [];
    for (let y = parseInt(tahunAwal); y <= parseInt(tahunAkhir); y++) {
      allYears.push(`${y}-1`, `${y}-2`);
    }

    const cplKeys = getCPLKeysForJenjang(jenjang);
    const datasets = [];

    allYears.forEach(yr => {
      const rows = data.filter(row =>
        String(row.Tahun || '').trim() === yr &&
        String(row["Nama Mata Kuliah"] || '').trim().toLowerCase() === mkInput.toLowerCase()
      );

      const sums = {}, counts = {};
      cplKeys.forEach(k => { sums[k] = 0; counts[k] = 0; });

      rows.forEach(row => {
        cplKeys.forEach(k => {
          const val = parseFloat(row[k]);
          if (!isNaN(val)) {
            sums[k] += val;
            counts[k]++;
          }
        });
      });

      const values = cplKeys.map(k => counts[k] ? (sums[k] / counts[k]) : 0);
      if (rows.length > 0) {
        datasets.push({ label: yr, data: values });
      }
    });

    if (datasets.length === 0) {
      alert("Data tidak ditemukan untuk kombinasi tersebut.");
      return;
    }

    drawTimeSeriesMhsBarChart(cplKeys.map(k => k.toUpperCase()), datasets, "mkChartContainer");

  } catch (err) {
    console.error("Gagal memuat data MK Time Series:", err);
    alert("Terjadi kesalahan saat memuat data.");
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
}

function drawTimeSeriesMhsBarChart(labels, datasets, canvasId) {
  const container = document.getElementById(canvasId);
  container.innerHTML = ""; // remove previous canvas
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Clear previous chart (if any)
  if (canvas._chartInstance) {
    canvas._chartInstance.destroy();
  }

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)"
  ];

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: colors[i % colors.length],
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Time-Series CPL Mata Kuliah",
          font: {
            size: 20,
            weight: 'bold'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 }, stacked: false },
      }
    }
  });

  canvas._chartInstance = chart;
}