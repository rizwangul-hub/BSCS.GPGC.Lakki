import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import Button from './Button';

/**
 * Reusable DataTable Component with Pagination, Loading States, Hover Animations, and Custom Actions
 */
const DataTable = ({
  headers = [],
  data = [],
  loading = false,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterComponent,
  pagination = null, // { page, pages, total, onPageChange }
  emptyMessage = 'No records found.',
  onExport,
  exportLabel = 'Export Data',
}) => {
  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {onSearchChange !== undefined && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-body text-secondary placeholder-slate-400 transition-all"
              />
              <span className="absolute right-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
            </div>
          )}
          {filterComponent}
        </div>

        {onExport && (
          <Button variant="outline" onClick={onExport} className="shrink-0 py-2.5 px-4 font-semibold text-xs border-slate-200 text-secondary hover:bg-slate-50 transition-colors">
            📥 {exportLabel}
          </Button>
        )}
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading whitespace-nowrap"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12">
                  <SkeletonLoader count={3} />
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, rowIdx) => (
                <motion.tr
                  key={row.id || row._id || rowIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(rowIdx * 0.03, 0.3) }}
                  className="hover:bg-slate-50/70 transition-all font-body text-sm text-secondary"
                >
                  {headers.map((header, colIdx) => (
                    <td key={colIdx} className="px-6 py-4.5 whitespace-nowrap">
                      {header.render ? header.render(row) : row[header.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-sm text-slate-400 font-body">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/30">
          <span className="text-xs text-slate-400 font-body">
            Showing Page <span className="font-bold text-secondary">{pagination.page}</span> of{' '}
            <span className="font-bold text-secondary">{pagination.pages}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="py-1.5 px-3.5 text-xs font-bold border-slate-200 hover:bg-white text-secondary transition-colors"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="py-1.5 px-3.5 text-xs font-bold border-slate-200 hover:bg-white text-secondary transition-colors"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
