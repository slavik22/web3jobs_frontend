export default function Table({ columns = [], data = [], empty = 'Немає даних' }) {
    return (
        <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key || c.header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                {c.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {!data.length && (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">{empty}</td>
                        </tr>
                    )}
                    {data.map((row, i) => (
                        <tr key={row.id || i} className="border-t hover:bg-gray-50">
                            {columns.map((c) => (
                                <td key={c.key || c.header} className="px-4 py-3 align-middle">
                                    {typeof c.cell === 'function' ? c.cell(row) : row[c.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}