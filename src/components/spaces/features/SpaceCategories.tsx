import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SpaceCategory = 'Tech' | 'Music' | 'Gaming' | 'Social' | 'Education' | 'Other';

interface SpaceCategoriesProps {
  selectedCategory?: SpaceCategory;
  onSelectCategory: (category: SpaceCategory) => void;
}

export const SpaceCategories = ({
  selectedCategory,
  onSelectCategory
}: SpaceCategoriesProps) => {
  const categories: SpaceCategory[] = ['Tech', 'Music', 'Gaming', 'Social', 'Education', 'Other'];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className={cn(
            "cursor-pointer hover:bg-primary/20 transition-colors",
            selectedCategory === category && "bg-primary text-primary-foreground hover:bg-primary"
          )}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
};