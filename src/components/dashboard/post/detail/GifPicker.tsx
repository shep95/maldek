
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from "lucide-react";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export const GifPicker = ({ onSelect, onClose }: GifPickerProps) => {
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchGifs = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&q=${query}&limit=20&rating=g`
      );
      const data = await response.json();
      setGifs(data.data);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.length > 2) {
      searchGifs(value);
    }
  };

  return (
    <div className="absolute bottom-full mb-2 bg-background border rounded-lg shadow-lg w-full max-w-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search GIFs..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif.images.fixed_height.url)}
                className="p-1 rounded hover:bg-accent/50 transition-colors"
              >
                <img
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  className="w-full h-auto rounded"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
