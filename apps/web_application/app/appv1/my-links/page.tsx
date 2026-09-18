"use client";

import { useState, useRef } from "react";
import { Link2, ArrowUp, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function MyLinksPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      setUrl(""); // Clear input on success
      
      // Reset textarea height back to single line
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, 1000); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrl(e.target.value);
    // Auto-expand logic
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 mt-16 md:mt-24 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Shorten a link
        </h2>
        <p className="text-muted-foreground">
          Paste your long URL to create a clean, trackable short link.
        </p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-end w-full p-2 bg-muted/40 border border-muted-foreground/20 rounded-[28px] focus-within:bg-background focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200"
      >
        <div className="flex items-center justify-center h-10 w-10 shrink-0 text-muted-foreground ml-1 mb-0.5">
          <Link2 className="h-5 w-5" />
        </div>

        <Textarea
          ref={textareaRef}
          required
          rows={1}
          placeholder="https://abc****.xyz"
          value={url}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 max-h-50 min-h-10 py-3 px-2 text-base bg-transparent border-0 focus-visible:ring-0 shadow-none resize-none outline-none overflow-y-auto mb-0.5"
        />

        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all mb-0.5 mx-1"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}