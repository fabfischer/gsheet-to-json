export default function ({
  id,
  sheetName = '',
  apiKey = '',
  query = '',
  hasHeadRow = true,
  useIntegers = true,
  showRows = true,
  showColumns = true,
}) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${sheetName}?alt=json&key=${apiKey}`;

  return fetch(url, {
    method: 'GET',
  })
    .then(response => response.json())
    .then((data) => {
      const responseObj = {};
      const rows = [];
      const columns = {};
      const columnIndices = []

      for (let i = 0; i < data.values.length; i += 1) {
        const newRow = {};
        let queried = false;
        if (hasHeadRow === true && i === 0) {
          if (data.values[i].length) {
            data.values[i].forEach((element, index) => {
              columns[element] = [];
              columnIndices[index] = element
            });
          }
        } else {
          if (data.values[i].length) {
            data.values[i].forEach((value, index) => {

              if (value.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                queried = true;
              }

              if (useIntegers && !Number.isNaN(Number(value))) {
                value = Number(value);
              }

              const name = columnIndices[index] ? columnIndices[index] : index
              newRow[name] = value;

              if (queried) {
                if (typeof columns[name] === "undefined") {
                  columns[name] = []
                }
                columns[name].push(value);
              }

            });
          }
        }
        if (queried) {
          rows.push(newRow);
        }
      }

      if (showColumns) {
        responseObj.columns = columns;
        responseObj.columnIndices = columnIndices
      }

      if (showRows) {
        responseObj.rows = rows;
      }

      return responseObj;
    })
    .catch((error) => {
      throw new Error(`Spreadsheet to JSON: There has been a problem with your fetch operation: ${error.message}`);
    });
}
