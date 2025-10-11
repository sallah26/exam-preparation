"use client";

import { useRouter } from "next/navigation";

export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
  isClickable?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const router = useRouter();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.isClickable !== false) {
      router.push(item.path);
    }
  };

  return (
    <div className={`border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav
          className="flex"
          aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            {items.map((item, index) => (
              <li key={item.id}>
                {index === 0 ? (
                  // Home icon for first item
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center gap-2 ${
                      item.isClickable !== false
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-900"
                    }`}>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="">{item.name}</span>
                  </button>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item.isClickable !== false ? (
                      <button
                        onClick={() => handleItemClick(item)}
                        className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                        {item.name}
                      </button>
                    ) : (
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
