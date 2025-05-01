let numCriteria, numAlternatives;

function generateTables() {
  numCriteria = parseInt(document.getElementById("numCriteria").value);
  numAlternatives = parseInt(document.getElementById("numAlternatives").value);

  // Create the criteria weights table
  const criteriaTable = document.getElementById("criteriaWeightsTable");
  criteriaTable.innerHTML = ""; // Clear any previous content
  for (let i = 0; i < numCriteria; i++) {
    let row = criteriaTable.insertRow();
    let cell = row.insertCell(0);
    cell.innerHTML = `<label for="weight${i}">Weight for C${i + 1}: </label><input type="number" id="weight${i}" min="0" step="0.01" placeholder="Enter weight" />`;
  }

  // Show the criteria form
  document.getElementById("criteriaForm").style.display = "block";

  // Create the decision matrix table
  const decisionMatrixTable = document.getElementById("decisionMatrixTable");
  decisionMatrixTable.innerHTML = ""; // Clear any previous content
  for (let i = 0; i < numAlternatives; i++) {
    let row = decisionMatrixTable.insertRow();
    let cell = row.insertCell(0);
    cell.innerHTML = `<strong>Alternative A${i + 1}</strong>`;
    for (let j = 0; j < numCriteria; j++) {
      row.insertCell(j + 1).innerHTML = `<input type="number" id="value${i}_${j}" placeholder="Enter value" />`;
    }
  }

  // Show the decision matrix form
  document.getElementById("decisionMatrixForm").style.display = "block";
}

function calculateMatrices() {
  // Retrieve the weights
  const weights = [];
  for (let i = 0; i < numCriteria; i++) {
    weights.push(parseFloat(document.getElementById(`weight${i}`).value));
  }

  // Retrieve the decision matrix values
  const decisionMatrix = [];
  for (let i = 0; i < numAlternatives; i++) {
    const row = [];
    for (let j = 0; j < numCriteria; j++) {
      row.push(parseFloat(document.getElementById(`value${i}_${j}`).value));
    }
    decisionMatrix.push(row);
  }

  // Stage 1: Formation of the Result Matrix (X)
  const X = decisionMatrix;

  // Stage 2: Normalization of the Decision Matrix (X)
  const normalizedMatrix = normalizeMatrix(X);

  // Stage 3: Calculation of the Weighted Matrix (V)
  const weightedMatrix = calculateWeightedMatrix(normalizedMatrix, weights);

  // Stage 4: Boundary Approximate Area Matrix (G)
  const G = calculateBoundaryApproximateArea(weightedMatrix);

  // Stage 5: Calculation of the Distance Matrix (Q)
  const Q = calculateDistanceMatrix(weightedMatrix, G);

  // Stage 6: Alternative Ranking
  const rankings = calculateRankings(Q);

  // Display Results
  displayResults(X, normalizedMatrix, weightedMatrix, G, Q, rankings);
}

function normalizeMatrix(matrix) {
  const normalizedMatrix = matrix.map((row, i) => {
    return row.map((value, j) => {
      const max = Math.max(...matrix.map((row) => row[j]));
      const min = Math.min(...matrix.map((row) => row[j]));
      return (value - min) / (max - min); // Benefit criteria normalization
    });
  });
  return normalizedMatrix;
}

function calculateWeightedMatrix(matrix, weights) {
  return matrix.map((row) => {
    return row.map((value, i) => value * weights[i]);
  });
}

function calculateBoundaryApproximateArea(matrix) {
  return matrix[0].map((_, j) => {
    const product = matrix.reduce((acc, row) => acc * row[j], 1);
    return Math.pow(product, 1 / matrix.length);
  });
}

function calculateDistanceMatrix(matrix, G) {
  return matrix.map((row, i) => {
    return row.map((value, j) => value - G[j]);
  });
}

function calculateRankings(Q) {
  const scores = Q.map((row) => row.reduce((sum, value) => sum + value, 0));
  const rankings = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ alternative: `A${item.index + 1}`, rank: index + 1 }));
  return rankings;
}

function displayResults(X, normalizedMatrix, weightedMatrix, G, Q, rankings) {
  const resultsDiv = document.getElementById("results");
  let html = "<h3>Formation of the Result Matrix (X)</h3><table><tr><th>Alternatives</th>";

  for (let i = 0; i < numCriteria; i++) {
    html += `<th>C${i + 1}</th>`;
  }
  html += "</tr>";

  X.forEach((row, index) => {
    html += `<tr><td>A${index + 1}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  html += "<h3>Normalized Decision Matrix (X)</h3><table><tr><th>Alternatives</th>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>C${i + 1}</th>`;
  }
  html += "</tr>";

  normalizedMatrix.forEach((row, index) => {
    html += `<tr><td>A${index + 1}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  html += "<h3>Weighted Matrix (V)</h3><table><tr><th>Alternatives</th>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>C${i + 1}</th>`;
  }
  html += "</tr>";

  weightedMatrix.forEach((row, index) => {
    html += `<tr><td>A${index + 1}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  html += "<h3>Boundary Approximate Area Matrix (G)</h3><table><tr><th>C1</th><th>C2</th><th>C3</th><th>C4</th></tr><tr>";
  G.forEach((value) => {
    html += `<td>${value}</td>`;
  });
  html += "</tr></table>";

  html += "<h3>Distance Matrix (Q)</h3><table><tr><th>Alternatives</th>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>C${i + 1}</th>`;
  }
  html += "</tr>";

  Q.forEach((row, index) => {
    html += `<tr><td>A${index + 1}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";

  html += "<h3>Alternative Rankings</h3><table><tr><th>Alternative</th><th>Rank</th></tr>";
  rankings.forEach((ranking) => {
    html += `<tr><td>${ranking.alternative}</td><td>${ranking.rank}</td></tr>`;
  });
  html += "</table>";

  resultsDiv.innerHTML = html;
}

function importExcel() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    console.log("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = e.target.result;
    console.log("File loaded:", file.name);

    const workbook = XLSX.read(data, { type: "binary" });
    console.log("Workbook read:", workbook);

    const criteriaSheet = workbook.Sheets["Criteria Weights"];
    const decisionSheet = workbook.Sheets["Decision Matrix"];

    const criteriaData = XLSX.utils.sheet_to_json(criteriaSheet, { header: 1 });
    const decisionData = XLSX.utils.sheet_to_json(decisionSheet, { header: 1 });

    console.log("Criteria Data:", criteriaData);
    console.log("Decision Data:", decisionData);

    // Parse and format data correctly (comma to period)
    const criteriaWeights = criteriaData[1].map((weight) => parseFloat(weight.replace(",", ".")));
    console.log("Parsed Criteria Weights:", criteriaWeights);

    const decisionMatrix = decisionData.slice(1).map((row) => {
      return row.slice(1).map((value) => parseFloat(value.replace(",", ".")));
    });
    console.log("Parsed Decision Matrix:", decisionMatrix);
  };

  reader.onerror = function (error) {
    console.log("Error reading file:", error);
  };

  reader.readAsBinaryString(file);
}
