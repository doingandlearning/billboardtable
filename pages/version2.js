import React from "react";
import { readRemoteFile } from "react-papaparse";
import { useTable, useSortBy, useBlockLayout, useFilters } from "react-table";
import { FixedSizeList } from "react-window";


// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}


export default function App() {
  const [rawData, setRawData] = React.useState([]);

  React.useEffect(() => {
    (async function fetchFunction() {
      readRemoteFile("/data/billboard.csv", {
        header: true,
        complete: (raw) => setRawData(raw.data)
      });
    })();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Track',
        accessor: 'track'
      },
      {
        Header: "Album Art",
        accessor: "albumArtUrl",
        Cell: ({ value }) => <img src={value} />,
        width: 115
      },
      {
        Header: 'Artist',
        accessor: 'primaryArtist'
      },
      {
        Header: 'Album Name',
        accessor: 'albumName',
      },
      {
        Header: "Year",
        accessor: 'year'
      },
      {
        Header: "Play",
        accessor: 'trackPlayUrl',
        Cell: ({ value }) => <a href={value}>Listen on Spotify</a>
      }
    ],
    []
  )

  const data = React.useMemo(() => rawData, [rawData])

  const defaultColumn = React.useMemo(
    () => ({
      width: 350,
      Filter: DefaultColumnFilter

    }),
    []
  )
  const {
    getTableProps, // resolves any props needs for the table wrapper
    getTableBodyProps, // resolves any props needed for the body wrapper
    headerGroups, // array of header groups
    rows, // an array of row objects
    prepareRow, // a function that lazily prepares a row for rendering
    totalColumnsWidth
  } = useTable({
    columns,
    data,
    defaultColumn
  },
    useBlockLayout, useFilters, useSortBy);

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index]
      prepareRow(row)
      return (
        <div
          {...row.getRowProps({
            style,
          })}
          className=""
        >
          {row.cells.map(cell => {
            return (
              <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {cell.render('Cell')}
              </td>
            )
          })}
        </div>
      )
    },
    [prepareRow, rows]
  )

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render("Header")}
                <span> {column.isSorted
                  ? column.isSortedDesc
                    ? ' 🔽'
                    : ' 🔼'
                  : ''}</span>
                <div>{column.canFilter ? column.render('Filter') : null}</div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        <FixedSizeList
          height={800}
          itemCount={rows.length}
          itemSize={70}
          width={totalColumnsWidth}
        >
          {RenderRow}
        </FixedSizeList>
      </tbody>
    </table>
  )
}
