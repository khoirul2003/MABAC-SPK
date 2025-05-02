let numCriteria, numAlternatives;

function generateTables() {
  numCriteria = parseInt(document.getElementById("numCriteria").value);
  numAlternatives = parseInt(document.getElementById("numAlternatives").value);

  const criteriaTable = document.getElementById("criteriaWeightsTable");
  criteriaTable.innerHTML = "";
  for (let i = 0; i < numCriteria; i++) {
    let row = criteriaTable.insertRow();

    // Name for Criteria
    let nameCell = row.insertCell(0);
    nameCell.innerHTML = `<label for="criterionName${i}" class="form-label">Name for C${i + 1}:</label><input type="text" id="criterionName${i}" class="form-control" placeholder="Enter name for C${i + 1}">`;

    // Weight for Criteria
    let weightCell = row.insertCell(1);
    weightCell.innerHTML = `<label for="weight${i}" class="form-label">Weight for C${i + 1}:</label><input type="number" id="weight${i}" class="form-control" min="0" step="0.01" placeholder="Enter weight">`;
  }

  document.getElementById("criteriaForm").style.display = "block";

  const decisionMatrixTable = document.getElementById("decisionMatrixTable");
  decisionMatrixTable.innerHTML = "";
  for (let i = 0; i < numAlternatives; i++) {
    let row = decisionMatrixTable.insertRow();

    // Name for Alternative
    let nameCell = row.insertCell(0);
    nameCell.innerHTML = `<label for="alternativeName${i}" class="form-label">Name for A${i + 1}:</label><input type="text" id="alternativeName${i}" class="form-control" placeholder="Enter name for A${i + 1}">`;

    // Decision Matrix Values
    for (let j = 0; j < numCriteria; j++) {
      row.insertCell(j + 1).innerHTML = `<input type="number" id="value${i}_${j}" class="form-control" placeholder="Enter value">`;
    }
  }

  document.getElementById("decisionMatrixForm").style.display = "block";
}

function calculateMatrices() {
  const weights = [];
  for (let i = 0; i < numCriteria; i++) {
    weights.push(parseFloat(document.getElementById(`weight${i}`).value));
  }

  const criteriaNames = [];
  for (let i = 0; i < numCriteria; i++) {
    criteriaNames.push(document.getElementById(`criterionName${i}`).value || `C${i + 1}`);
  }

  const decisionMatrix = [];
  for (let i = 0; i < numAlternatives; i++) {
    const row = [];
    for (let j = 0; j < numCriteria; j++) {
      row.push(parseFloat(document.getElementById(`value${i}_${j}`).value));
    }
    decisionMatrix.push(row);
  }

  const alternativeNames = [];
  for (let i = 0; i < numAlternatives; i++) {
    alternativeNames.push(document.getElementById(`alternativeName${i}`).value || `A${i + 1}`);
  }

  const X = decisionMatrix;
  const normalizedMatrix = normalizeMatrix(X);
  const weightedMatrix = calculateWeightedMatrix(normalizedMatrix, weights);
  const G = calculateBoundaryApproximateArea(weightedMatrix);
  const Q = calculateDistanceMatrix(weightedMatrix, G);
  const rankings = calculateRankings(Q, alternativeNames);

  displayResults(X, normalizedMatrix, weightedMatrix, G, Q, rankings, criteriaNames, alternativeNames);
}

function normalizeMatrix(matrix) {
  const normalizedMatrix = matrix.map((row, i) => {
    return row.map((value, j) => {
      const max = Math.max(...matrix.map((row) => row[j]));
      const min = Math.min(...matrix.map((row) => row[j]));
      return (value - min) / (max - min);
    });
  });
  return normalizedMatrix;
}

function calculateWeightedMatrix(matrix, weights) {
  return matrix.map((row) => {
    return row.map((value, i) => (value * weights[i])+weights[i]);
  });
}

function calculateBoundaryApproximateArea(matrix) {
  const boundaryMatrix = matrix[0].map((_, i) => {
    const product = matrix.map((row) => row[i]).reduce((acc, value) => acc * (value || 1), 1);
    return Math.pow(product, 1 / matrix.length);
  });
  return boundaryMatrix;
}

function calculateDistanceMatrix(matrix, G) {
  return matrix.map((row, i) => {
    return row.map((value, j) => Math.abs(value - G[j]));
  });
}

function calculateRankings(Q, alternativeNames) {
  const scores = Q.map((row) => row.reduce((sum, value) => sum + value, 0));

  const rankings = scores
    .map((score, index) => ({
      alternative: alternativeNames[index], 
      score, 
      index, 
    }))
    .sort((a, b) => b.score - a.score) 
    .map((item, index) => ({
      alternative: item.alternative,
      score: item.score, 
      rank: index + 1,
    }));

  return rankings;
}

function displayResults(X, normalizedMatrix, weightedMatrix, G, Q, rankings, criteriaNames, alternativeNames) {
  const resultsDiv = document.getElementById("results");
  let html = "<h3>Formation of the Result Matrix (X)</h3><div class='table-responsive'><table class='table table-striped table-bordered'><tr><th>Alternatives</th>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>${criteriaNames[i]}</th>`;
  }
  html += "</tr>";

  X.forEach((row, index) => {
    html += `<tr><td>${alternativeNames[index]}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table></div>";

  html += "<h3>Normalized Decision Matrix (X)</h3><div class='table-responsive'><table class='table table-striped table-bordered'><tr><th>Alternatives</th>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>${criteriaNames[i]}</th>`;
  }
  html += "</tr>";

  normalizedMatrix.forEach((row, index) => {
    html += `<tr><td>${alternativeNames[index]}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table></div>";

  html += "<h3>Weighted Matrix (V)</h3><div class='table-responsive'><table class='table table-striped table-bordered'><tr><th>Alternatives</th>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>${criteriaNames[i]}</th>`;
  }
  html += "</tr>";

  weightedMatrix.forEach((row, index) => {
    html += `<tr><td>${alternativeNames[index]}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table></div>";

  html += "<h3>Boundary Approximate Area Matrix (G)</h3><div class='table-responsive'><table class='table table-striped table-bordered'><tr>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>${criteriaNames[i]}</th>`;
  }
  html += "</tr><tr>";
  G.forEach((value) => {
    html += `<td>${value}</td>`;
  });
  html += "</tr></table></div>";

  html += "<h3>Distance Matrix (Q)</h3><div class='table-responsive'><table class='table table-striped table-bordered'><tr><th>Alternatives</th>";
  for (let i = 0; i < numCriteria; i++) {
    html += `<th>${criteriaNames[i]}</th>`;
  }
  html += "</tr>";

  Q.forEach((row, index) => {
    html += `<tr><td>${alternativeNames[index]}</td>`;
    row.forEach((value) => {
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</table></div>";

  html += "<h3>Alternative Rankings</h3><div class='table-responsive'><table class='table table-striped table-bordered'><tr><th>Alternative</th><th>Score</th><th>Rank</th></tr>";

  rankings.forEach((ranking) => {
    html += `<tr><td>${ranking.alternative}</td><td>${ranking.score}</td><td>${ranking.rank}</td></tr>`;
  });
  html += "</table></div>";

  resultsDiv.innerHTML = html;
}
