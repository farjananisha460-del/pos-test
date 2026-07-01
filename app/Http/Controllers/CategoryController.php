<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'unique:categories,name', 'max:255'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        Category::create($validated);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', "unique:categories,name,{$category->id}", 'max:255'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category)
    {
        // Prevent deletion if products exist
        if ($category->products()->count() > 0) {
            return redirect()->back()->withErrors([
                'category' => 'Cannot delete category with associated products.'
            ]);
        }

        $category->delete();
        return redirect()->back()->with('success', 'Category deleted.');
    }
}
