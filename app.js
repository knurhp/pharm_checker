
function processData() {
  // Get the raw input data from the textareas.
  const listData = document.getElementById("listInput").value;
  const pharmData = document.getElementById("pharmInput").value;

  // Split the data into rows and then into cells (columns) by tab.
  const table1 = listData
    .split('\n')
    .map(row => row.trim())
    .filter(row => row !== "")
    .map(row => row.split('\t'));
  
  const table2 = pharmData
    .split('\n')
    .map(row => row.trim())
    .filter(row => row !== "")
    .map(row => row.split('\t'));

  // Build a lookup object for table2 using its unique identifier
  // (13th column, index 12). This assumes one row per unique identifier.
  const table2Lookup = {};
  table2.forEach(row => {
    if (row.length >= 13) {
      const id = row[12];
      table2Lookup[id] = row;
    }
  });

  // Process each row in table1.
  // For each row, we add two new columns:
  //    - Column with "YES" if matching table2 row is found and meets our datetime conditions.
  //    - Column with the corresponding table2 6th column (index 5) value.
  table1.forEach(row => {
    // Default: leave new columns blank.
    let newCol1 = "";
    let newCol2 = "";

    // Ensure there is at least a 2nd column for the unique id.
    if (row.length >= 2) {
      const uniqueId = row[1];
      
      // If the unique identifier exists in table2...
      if (table2Lookup.hasOwnProperty(uniqueId)) {
        const pharmRow = table2Lookup[uniqueId];

        // --- Parse table1 date and time ---
        // Table1 date is in col1 (index 0) in the format "15-Mar-24".
        const dateStr1 = row[0];
        const dateParts = dateStr1.split('-');
        if (dateParts.length >= 3) {
          let [day1, month1, year1] = dateParts;
          // Convert 2-digit year to 4-digit (assumes 2000+)
          if (year1.length === 2) {
            year1 = "20" + year1;
          }
          // Table1 time is in column 22 (index 21). If missing, default to "00:00".
          const timeStr1 = row[25] || "00:00";
          // Build a string that can be parsed by the Date constructor.
          const table1DateTimeStr = `${day1} ${month1} ${year1} ${timeStr1}`;
          const table1DateTime = new Date(table1DateTimeStr);

          // --- Parse table2 datetime ---
          // Table2 datetime is in col5 (index 4) in the format "27/Nov/2023 12:36:54".
          const table2DateTimeRaw = pharmRow[4];
          const parts2 = table2DateTimeRaw.split(' ');
          if (parts2.length >= 2) {
            const datePart2 = parts2[0]; // "27/Nov/2023"
            const timePart2 = parts2[1]; // "12:36:54"
            const dateParts2 = datePart2.split('/');
            if (dateParts2.length >= 3) {
              const [day2, month2, year2] = dateParts2;
              // Rebuild into a format that Date() can parse: "27 Nov 2023 12:36:54"
              const table2DateTimeStr = `${day2} ${month2} ${year2} ${timePart2}`;
              const table2DateTime = new Date(table2DateTimeStr);

              // --- Compare the two Date objects ---
              // If table2's date/time is the same or before table1's date/time...
              if (table2DateTime <= table1DateTime) {
                newCol1 = "YES";
                // Table2's 6th column (index 5) is used for the second new column.
                newCol2 = pharmRow[5] || "";
              }
            }
          }
        }
      }
    }
    
    // Append the new columns to the current row.
    row.push(newCol1, newCol2);
  });

  // --- Build the HTML table to display the result ---
  const outputTable = document.getElementById("outputTable");
  // Clear any existing content.
  outputTable.innerHTML = "";

  // Create a table row for each row in table1.
  table1.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    outputTable.appendChild(tr);
  });
}

