"use client";

import { useState, useRef } from "react";
import { Link2, ArrowUp, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/eden";
import { useFetchApi } from "@/hooks/useFetchApi";

export default function MyLinksPage() {
  const [url, setUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, error, loading, execute } = useFetchApi<
    { shortCode: string; originalUrl: string },
    { message: string }
  >();
  
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;
    
    await execute(() => api.url.create.post({ url }));
    
    setUrl(""); 
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrl(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 mt-16 md:mt-24 space-y-8">
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
          disabled={loading || !url.trim()}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all mb-0.5 mx-1"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </Button>
      </form>

      {/* Result Display */}
      {data && (
        <div className="p-4 bg-primary/10 text-primary rounded-xl border border-primary/20 text-center animate-in fade-in slide-in-from-bottom-2">
          Successfully shortened:{" "}
          <a href={`/${data.shortCode}`} target="_blank" rel="noreferrer" className="font-bold underline hover:text-primary/80 transition-colors">
            {typeof window !== "undefined" ? window.location.origin : ""}/{data.shortCode}
          </a>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center animate-in fade-in slide-in-from-bottom-2">
          {error}
        </div>
      )}
    </div>
  );
}