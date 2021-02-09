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


  // acousticness: "0.843"
  // albumArtUrl: "https://i.scdn.co/image/ab67616d00001e0221f4406a4e4ff4b99b99d506"
  // albumName: "The Best Of The Decca Years"
  // artistCredits: "Gordon Jenkins & The Weavers"
  // danceability: "0.335"
  // durationMs: "202240"
  // energy: "0.255"
  // instrumentalness: "0"
  // key: "5"
  // liveness: "0.26"
  // loudness: "-10.561"
  // mode: "1"
  // primaryArtist: "Gordon Jenkins"
  // rank: "1"
  // speechiness: "0.0277"
  // tempo: "141.158"
  // timeSignature: "3"
  // track: "Goodnight Irene"
  // trackId: "1fhLgOJgIIZEsWWffk8ljs"
  // trackPlayUrl: "https://open.spotify.com/track/1fhLgOJgIIZEsWWffk8ljs"
  // trackPopularity: "15"
  // trackPreviewUrl: ""
  // valence: "0.556"
  // year: "1950-01-01T07:00:00.000Z"
  const columns = React.useMemo(
    () => [
      {
        Header: 'Track',
        accessor: 'track'
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
      }
    ],
    []
  )

  const data = React.useMemo(() => rawData, [rawData])

  return (
    <Table columns={columns} data={data} />
  )
}

function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )
  const defaultColumn = React.useMemo(
    () => ({
      width: 350,
      Filter: DefaultColumnFilter
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes
    },
    useBlockLayout,
    useFilters,
    useSortBy
  )

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

  // Render the UI for your table
  return (
    <div {...getTableProps()} className="m-8">
      <div>
        {headerGroups.map(headerGroup => (
          <thead {...headerGroup.getHeaderGroupProps()} className=" bg-gray-50">
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())} cope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.render('Header')}
                <span> {column.isSorted
                  ? column.isSortedDesc
                    ? ' 🔽'
                    : ' 🔼'
                  : ''}</span>
                <div>{column.canFilter ? column.render('Filter') : null}</div>
              </th>
            ))}
          </thead>
        ))}
      </div>

      <div {...getTableBodyProps()}>
        <FixedSizeList
          height={800}
          itemCount={rows.length}
          itemSize={70}
          width={totalColumnsWidth}
        >
          {RenderRow}
        </FixedSizeList>
      </div>
    </div>
  )
}