"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus, X, Plus, Minus, ChevronDown, Search, Check } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/layout/BottomNav";
import { cuisines, difficulties } from "@/lib/dummy-data";
import { createRecipe } from "@/lib/actions/recipes";

const inputCls = "w-full bg-white border border-[#E5E9F2] rounded-2xl px-4 py-3 text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none focus:border-[#2EC4B6] transition-colors shadow-sm";
const labelCls = "block text-xs font-semibold text-[#192A56] mb-1.5";

export default function CreateRecipePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState(2);
  const [difficulty, setDifficulty] = useState("Easy");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState("");
  const cuisineRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cuisineRef.current && !cuisineRef.current.contains(e.target as Node)) {
        setCuisineOpen(false);
        setCuisineSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleCuisine(c: string) {
    setSelectedCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function removeCuisine(c: string) {
    setSelectedCuisines((prev) => prev.filter((x) => x !== c));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

function addIngredient(e: React.KeyboardEvent<HTMLInputElement>) {
  console.log("KEY:", e.key);

  if (e.key === "Enter") {
    e.preventDefault();

    const value = e.currentTarget.value.trim();
    if (!value) return;

    setIngredients((prev) => [...prev, value]);
    setIngredientInput("");
  }
}

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags((p) => [...p, tagInput.trim().toLowerCase().replace(/\s+/g, "-")]);
      setTagInput("");
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Recipe title is required");
    const finalIngredients = ingredientInput.trim() ? [...ingredients, ingredientInput.trim()] : ingredients;
    if (finalIngredients.length === 0) return toast.error("Add at least one ingredient");
    if (steps.filter((s) => s.trim()).length === 0) return toast.error("Add at least one step");

    setLoading(true);
    try {
      const formData = new FormData();
      if (coverFile) formData.append("cover_image", coverFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("ingredients", JSON.stringify(finalIngredients));
      formData.append("preparation_steps", JSON.stringify(steps.filter((s) => s.trim())));
      formData.append("prep_time", prepTime || "0");
      formData.append("cook_time", cookTime || "0");
      formData.append("servings", String(servings));
      formData.append("difficulty", difficulty);
      formData.append("cuisine", JSON.stringify(selectedCuisines));
      formData.append("tags", JSON.stringify(tags));

      const recipe = await createRecipe(formData);
      toast.success("Recipe published!");
      router.push(`/recipe/${recipe.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to publish recipe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFF]">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[#F7F3E3] border-b border-[#E5E9F2]">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors">
          <ChevronLeft size={22} className="text-[#192A56]" />
        </button>
        <span className="text-base font-bold text-[#192A56]">Create Recipe</span>
        <div className="w-8" />
      </div>

      <form onSubmit={handlePublish} className="flex-1 pb-24 px-6 lg:px-10 xl:px-12 py-6 w-full max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-auto">
        <div className="space-y-5">

        {/* Cover image + Title/Description — side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="lg:w-64 xl:w-72 2xl:w-80 shrink-0">
            <label className={labelCls}>Cover Image</label>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-44 lg:h-52 bg-white border-2 border-dashed border-[#E5E9F2] rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-[#2EC4B6] transition-colors relative shadow-sm"
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover" fill className="object-cover" />
              ) : (
                <>
                  <ImagePlus size={32} className="text-[#2EC4B6]" />
                  <span className="text-sm font-medium text-[#5C677D]">Tap to upload</span>
                  <span className="text-[11px] text-[#5C677D]">PNG, JPG, WEBP · max 5MB</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label className={labelCls}>Recipe Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spicy Chicken Curry" className={inputCls} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your recipe..." rows={5} className={`${inputCls} resize-none h-full min-h-[100px]`} />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className={labelCls}>Ingredients *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {ingredients.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-[#2EC4B6]/10 text-[#2EC4B6] text-xs font-medium px-3 py-1 rounded-full">
                {item}
                <button type="button" onClick={() => setIngredients((p) => p.filter((_, idx) => idx !== i))}><X size={11} /></button>
              </span>
            ))}
          </div>
          <input
  type="text"
  value={ingredientInput}
  onChange={(e) => setIngredientInput(e.target.value)}
  onKeyDown={addIngredient}
  enterKeyHint="done"
  autoComplete="off"
  placeholder="Type an ingredient and press Enter..."
  className={inputCls}
/>
        </div>

        {/* Steps */}
        <div>
          <label className={labelCls}>Preparation Steps *</label>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#2EC4B6] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <textarea value={step} onChange={(e) => setSteps((p) => p.map((s, idx) => idx === i ? e.target.value : s))} placeholder={`Step ${i + 1}...`} rows={1} className={`${inputCls} resize-none flex-1`} />
                {steps.length > 1 && (
                  <button type="button" onClick={() => setSteps((p) => p.filter((_, idx) => idx !== i))} className="text-[#5C677D] hover:text-red-500 transition-colors shrink-0"><X size={16} /></button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSteps((p) => [...p, ""])} className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#2EC4B6]">
            <Plus size={13} /> Add Step
          </button>
        </div>

        {/* Prep + Cook time with "min" inside input */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Prep Time</label>
            <div className="flex items-center bg-white border border-[#E5E9F2] rounded-2xl px-4 h-12 shadow-sm focus-within:border-[#2EC4B6] transition-colors">
              <input
                type="number" min={0}
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-sm text-[#192A56] outline-none w-full"
              />
              <span className="text-xs text-[#5C677D] font-medium shrink-0">min</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Cook Time</label>
            <div className="flex items-center bg-white border border-[#E5E9F2] rounded-2xl px-4 h-12 shadow-sm focus-within:border-[#2EC4B6] transition-colors">
              <input
                type="number" min={0}
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-sm text-[#192A56] outline-none w-full"
              />
              <span className="text-xs text-[#5C677D] font-medium shrink-0">min</span>
            </div>
          </div>
        </div>

        {/* Servings + Difficulty same row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Servings</label>
            <div className="flex items-center justify-between bg-white border border-[#E5E9F2] rounded-2xl px-3 h-12 shadow-sm">
              <button type="button" onClick={() => setServings((p) => Math.max(1, p - 1))} className="w-7 h-7 rounded-full bg-[#F7F3E3] flex items-center justify-center text-[#192A56] hover:bg-[#E5E9F2] transition-colors">
                <Minus size={14} />
              </button>
              <span className="text-[16px] font-bold text-[#192A56] min-w-[24px] text-center">{servings}</span>
              <button type="button" onClick={() => setServings((p) => p + 1)} className="w-7 h-7 rounded-full bg-[#2EC4B6] flex items-center justify-center text-white hover:bg-[#28b0a3] transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Difficulty</label>
            <div className="flex gap-1 h-12 sm:h-12">
              {difficulties.filter((d) => d !== "All").map((d) => (
                <button
                  key={d} type="button"
                  onClick={() => setDifficulty(d)}
                   className={`flex-1 h-full rounded-lg text-[10px] sm:text-xs font-medium border transition-all px-1 ${
            difficulty === d
              ? "bg-[#2EC4B6] text-white border-[#2EC4B6]"
              : "bg-white text-[#5C677D] border-[#E5E9F2]"
          }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cuisine searchable multi-select */}
        <div>
          <label className={labelCls}>Cuisine</label>
          <div ref={cuisineRef} className="relative">
            {/* Selected tags above trigger */}
            {selectedCuisines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 pl-1">
                {selectedCuisines.map((c) => (
                  <span key={c} className="flex items-center gap-1 px-2.5 py-1 bg-[#2EC4B6] text-white text-xs font-semibold rounded-full">
                    {c}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeCuisine(c); }}><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Trigger */}
            <button
              type="button"
              onClick={() => { setCuisineOpen(!cuisineOpen); setCuisineSearch(""); }}
              className="w-full flex items-center justify-between px-4 h-11 rounded-2xl border bg-white text-[#192A56] border-[#E5E9F2] text-sm font-semibold transition-all"
            >
              <span className={selectedCuisines.length === 0 ? "text-[#5C677D]" : "text-[#192A56]"}>
                {selectedCuisines.length === 0 ? "Select cuisines..." : `${selectedCuisines.length} selected`}
              </span>
              <ChevronDown size={16} className={`text-[#5C677D] transition-transform ${cuisineOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {cuisineOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-[#E5E9F2] rounded-2xl shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E9F2]">
                  <Search size={14} className="text-[#5C677D] shrink-0" />
                  <input
                    autoFocus
                    value={cuisineSearch}
                    onChange={(e) => setCuisineSearch(e.target.value)}
                    placeholder="Search cuisine..."
                    className="flex-1 text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none bg-transparent"
                  />
                  {cuisineSearch && <button type="button" onClick={() => setCuisineSearch("")}><X size={13} className="text-[#5C677D]" /></button>}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {cuisines
                    .filter((c) => c !== "All" && c.toLowerCase().includes(cuisineSearch.toLowerCase()))
                    .map((c) => {
                      const selected = selectedCuisines.includes(c);
                      return (
                        <button
                          key={c} type="button"
                          onClick={() => toggleCuisine(c)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#F0FDFB] ${
                            selected ? "text-[#2EC4B6] font-semibold bg-[#F0FDFB]" : "text-[#192A56]"
                          }`}
                        >
                          {c}
                          {selected && <Check size={14} className="text-[#2EC4B6]" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className={labelCls}>Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-[#FF9F1C]/10 text-[#FF9F1C] text-xs font-medium px-3 py-1 rounded-full">
                #{tag}
                <button type="button" onClick={() => setTags((p) => p.filter((_, idx) => idx !== i))}><X size={11} /></button>
              </span>
            ))}
          </div>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type a tag and press Enter..." className={inputCls} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-[#2EC4B6] hover:bg-[#28b0a3] text-white font-semibold text-[15px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Publishing..." : "Publish Recipe"}
        </button>

        <div className="h-4" />
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
