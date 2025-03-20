
import { Button } from "@/components/ui/button";
import { Image, Video } from "lucide-react";

interface FileInputSectionProps {
  id: string;
  accept: string;
  icon: "video" | "image";
  label: string;
  selectedFile?: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const FileInputSection = ({
  id,
  accept,
  icon,
  label,
  selectedFile,
  onFileSelect,
  disabled = false,
}: FileInputSectionProps) => {
  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="hidden"
        id={id}
        disabled={disabled}
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById(id)?.click()}
        className="w-full gap-2"
        disabled={disabled}
      >
        {icon === "video" ? (
          <Video className="h-4 w-4" />
        ) : (
          <Image className="h-4 w-4" />
        )}
        {label}
      </Button>
      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          Selected: {selectedFile.name}
        </p>
      )}
    </div>
  );
};
