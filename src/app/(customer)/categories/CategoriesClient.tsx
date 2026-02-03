'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  Search,
  Grid3x3,
  ChevronRight,
  Package,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CategoryDto, CategoryTreeNode } from '@/services/catalogApi';

// Category images mapping - using Unsplash images
const categoryImages: Record<string, string> = {
  'industrial-equipment': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop&q=80',
  'machinery': 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop&q=80',
  'raw-materials': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop&q=80',
  'tools': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
  'components': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80',
};

const getCategoryImage = (slug: string, image?: string): string => {
  return image || categoryImages[slug] || categoryImages.default;
};

interface CategoriesClientProps {
  categories: CategoryDto[];
  tree: CategoryTreeNode[];
  topLevelCategories: CategoryDto[];
}

export function CategoriesClient({
  categories,
  tree,
  topLevelCategories,
}: CategoriesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;

    const query = searchQuery.toLowerCase();
    const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
      const matchesSearch =
        node.name.toLowerCase().includes(query) ||
        node.slug.toLowerCase().includes(query) ||
        (node.description && node.description.toLowerCase().includes(query));

      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is CategoryTreeNode => child !== null);

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    };

    return tree.map(filterNode).filter((node): node is CategoryTreeNode => node !== null);
  }, [tree, searchQuery]);

  const filteredTopLevelCategories = useMemo(() => {
    if (!searchQuery.trim()) return topLevelCategories;
    const query = searchQuery.toLowerCase();
    return topLevelCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query)),
    );
  }, [topLevelCategories, searchQuery]);

  return (
    <>
      {/* Search and Controls */}
      <div className="sticky top-[3px] md:top-[20px] z-50 isolate bg-surface/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg mb-8">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm border border-border rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'text-foreground/70 hover:text-foreground hover:bg-primary/5'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'text-foreground/70 hover:text-foreground hover:bg-primary/5'
                }`}
                aria-label="List view"
              >
                <Package className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Content */}
      {filteredTree.length === 0 && filteredTopLevelCategories.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-muted" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No categories found</h3>
          <p className="text-foreground/70 mb-6">
            Try adjusting your search query to find what you're looking for.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {filteredTopLevelCategories.map((category) => {
            const categoryImage = getCategoryImage(category.slug, category.image);

            return (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-surface shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 hover:border-primary/60"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted/40 to-muted/20">
                  <Image
                    src={categoryImage}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  />
                  
                  {/* Gradient Overlay - Enhanced */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  
                  {/* Animated Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5">
                    {/* Category Name */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-lg group-hover:text-white transition-colors">
                        {category.name}
                      </h3>
                      {/* Arrow Icon - Always Visible on Desktop, Hidden on Mobile */}
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110 group-hover:translate-x-1 shadow-lg">
                        <ArrowRight className="w-4 h-4 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                    
                    {/* Animated Underline */}
                    <div className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary rounded-full w-0 group-hover:w-full transition-all duration-500 mb-2" />
                    
                    {/* Subtle Bottom Gradient Line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-secondary/50" />
                  
                  {/* Bottom Glow Effect */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Border Glow on Hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-primary/0 group-hover:ring-2 group-hover:ring-primary/50 transition-all duration-500" />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTree.map((node) => (
            <CategoryTreeNodeComponent
              key={node._id}
              node={node}
              level={0}
              expandedCategories={expandedCategories}
              onToggle={toggleCategory}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface CategoryTreeNodeComponentProps {
  node: CategoryTreeNode;
  level: number;
  expandedCategories: Set<string>;
  onToggle: (id: string) => void;
}

function CategoryTreeNodeComponent({
  node,
  level,
  expandedCategories,
  onToggle,
}: CategoryTreeNodeComponentProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedCategories.has(node._id);
  const isTopLevel = level === 0;

  if (!node.isActive) return null;

  const categoryImage = getCategoryImage(node.slug, node.image);

  return (
    <div className="select-none">
      <Link
        href={`/categories/${node.slug}`}
        className={`
          group relative flex items-center gap-4 rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-sm p-4 md:p-6
          transition-all duration-300 hover:border-primary/50 hover:bg-surface hover:shadow-xl hover:-translate-y-1
          ${isTopLevel ? 'font-semibold' : ''}
          ${level > 0 ? 'ml-6 md:ml-8' : ''}
        `}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(node._id);
            }}
            className="flex-shrink-0 rounded-xl p-2 hover:bg-primary/10 transition-colors z-10"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={`w-5 h-5 text-primary transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-9 flex-shrink-0" />}

        {/* Category Image */}
        <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-border/50 group-hover:border-primary/50 transition-colors">
          <Image
            src={categoryImage}
            alt={node.name}
            width={96}
            height={96}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg sm:text-xl md:text-2xl truncate mb-1 ${
                  isTopLevel ? 'font-bold text-foreground' : 'font-semibold text-foreground'
                } group-hover:text-primary transition-colors`}
              >
                {node.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted truncate mb-1">/{node.slug}</p>
              {node.description && (
                <p className="text-sm text-foreground/70 line-clamp-2">{node.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {hasChildren && (
                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-xs font-semibold text-primary">
                    {node.children.length} Subcategories
                  </span>
                </div>
              )}
              {/* <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-sm shadow-md group-hover:shadow-lg transition-all">
                <span>Shop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div> */}
            </div>
          </div>
        </div>
      </Link>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-4 ml-6 md:ml-8 border-l-2 border-primary/20 pl-4 md:pl-6 space-y-3">
          {node.children.map((child) => (
            <CategoryTreeNodeComponent
              key={child._id}
              node={child}
              level={level + 1}
              expandedCategories={expandedCategories}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

