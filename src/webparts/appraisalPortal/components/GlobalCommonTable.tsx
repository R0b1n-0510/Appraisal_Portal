import * as React from 'react'
import { useState, useEffect } from "react";
import {
    Column,
    Table,
    useReactTable,
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    // sortingFns,
    getSortedRowModel,
    // FilterFn,
    // SortingFn,
    // ColumnDef,
    flexRender,
    // FilterFns,
} from '@tanstack/react-table'
import { FaSortDown, FaSortUp, FaSort, FaFileExcel, FaPrint } from "react-icons/fa";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

function Filter({

    column,
    table,
    placeholder,

}: {

    column: Column<any, any>;
    table: Table<any>;
    placeholder: any;

}): any {

    const columnFilterValue = column.getFilterValue();
    return (

        <input
            className="me-1 mb-1 on-search-cross form-control "
            title={placeholder?.placeholder}
            type="search"
            value={(columnFilterValue ?? "") as string}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={`${placeholder?.placeholder}`}
        />

    );

}

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return (
        <input {...props} value={value} onChange={e => setValue(e.target.value)} />
    )
}

const GlobalCommonTable = (props: any) => {
    let data = props?.data;
    let columns = props?.columns;
    // let excelDatas = props?.excelDatas;
    const fileExtension = ".xlsx";
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: false,
        filterFns: undefined
    })

    const downloadPdf = () => {
        const doc = new jsPDF({ orientation: 'landscape' });

        const tableElement = document.getElementById('my-table') as HTMLTableElement;
        autoTable(doc, { html: tableElement });

        doc.save('DataPrintOut.pdf');
    };

    const downloadExcel = () => {
        const filteredData = table?.getFilteredRowModel().rows.map(row => row.original);
        const arry = filteredData?.map((items: any) => ({ Id: items.Id, Title: items.Title, siteName: items.siteName, SiteComposition: items.SiteComposition }))
        const ws = XLSX.utils.json_to_sheet(arry);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, "Site-Composition-View" + fileExtension);
    };



    return (
        <>
            <div className='d-flex justify-content-between py-2'>
                <div>
                    <span className='me-2'>{`Showing ${table?.getFilteredRowModel()?.rows?.length} out of ${data?.length}`}</span>
                    <DebouncedInput
                        value={globalFilter ?? ''}
                        onChange={value => setGlobalFilter(String(value))}
                        className="p-2 font-lg border border-block"
                        placeholder="Search all columns..."
                    />
                </div>
                <div>
                    <a onClick={() => downloadExcel()}><FaFileExcel /></a>
                    <a onClick={() => downloadPdf()}>
                        <FaPrint />
                    </a>
                </div>
            </div>
            <table className="SortingTable table table-hover mb-0" id="my-table">
                <thead>
                    {table?.getHeaderGroups()?.map((headerGroup) => (
                        <tr key={headerGroup?.id}>
                            {headerGroup?.headers?.map((header) => {
                                return (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <div className="position-relative" style={{ display: "flex" }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {header.column.getCanFilter() ? (
                                                    // <span>
                                                    <Filter column={header.column} table={table} placeholder={header.column.columnDef}
                                                    />
                                                ) : // </span>
                                                    null}
                                                {header.column.getCanSort() ? (
                                                    <div
                                                        {...{
                                                            className:
                                                                header.column.getCanSort()
                                                                    ? "cursor-pointer select-none shorticon"
                                                                    : "",
                                                            onClick:
                                                                header.column.getToggleSortingHandler(),
                                                        }}
                                                    >
                                                        {header.column.getIsSorted() ? (
                                                            {
                                                                asc: <FaSortDown />,
                                                                desc: <FaSortUp />,
                                                            }[header.column.getIsSorted() as string] ?? null) : (<FaSort />)}
                                                    </div>) : ("")}
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody className='rowss'>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}
export default GlobalCommonTable
