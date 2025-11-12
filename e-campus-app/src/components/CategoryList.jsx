import { useCategories } from '../hooks/useApi'
import { CategoryListSkeleton } from './LoadingSkeletons'

export default function CategoryList({ selectedCategory, onCategoryClick, productCounts = {} }) {
  const { data, isLoading, isError } = useCategories()

  const categories = data?.data || []

  if (isLoading) {
    return <CategoryListSkeleton count={8} />
  }

  if (isError || categories.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No categories available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => {
        const itemCount = productCounts[category._id] || category.productCount || 0

        return (
          <button
            key={category._id}
            onClick={() => onCategoryClick(category._id)}
            className={`rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 border-2 ${
              selectedCategory === category._id
                ? 'bg-blue-50 border-blue-500 shadow-lg transform scale-105'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-center mb-3">
              <span className="text-4xl">{category.icon || '📦'}</span>
            </div>
            <h3
              className={`font-semibold mb-1 ${
                selectedCategory === category._id ? 'text-blue-700' : 'text-gray-900'
              }`}
            >
              {category.name}
            </h3>
            <p
              className={`text-sm ${
                selectedCategory === category._id ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}
            >
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </button>
        )
      })}
    </div>
  )
}
