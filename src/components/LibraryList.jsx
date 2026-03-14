export default function LibraryList({ libraries = [], onSelect }) {
  if (libraries.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">Aucune bibliothèque trouvée.</p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {libraries.map((lib) => (
        <li
          key={lib.id}
          onClick={() => onSelect?.(lib)}
          className="flex items-start gap-3 p-4 cursor-pointer hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
        >
          {/* Icon */}
          <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-lg" role="img" aria-label="bibliothèque">📚</span>
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{lib.name}</p>
            {lib.address && (
              <p className="text-sm text-gray-500 truncate">{lib.address}</p>
            )}
            {lib.openToday && (
              <span className="inline-block mt-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                Ouvert aujourd'hui
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
