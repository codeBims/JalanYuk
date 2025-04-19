<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TouristAttraction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TouristAttractionController extends Controller
{
    /**
     * Display a listing of tourist attractions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TouristAttraction::query();
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Search by query
        if ($request->has('query')) {
            $searchQuery = $request->query;
            $query->where(function ($q) use ($searchQuery) {
                $q->where('name', 'like', "%{$searchQuery}%")
                  ->orWhere('description', 'like', "%{$searchQuery}%")
                  ->orWhere('address', 'like', "%{$searchQuery}%");
            });
        }
        
        // Pagination
        $perPage = $request->input('limit', 10);
        $attractions = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'attractions' => $attractions->items(),
                'pagination' => [
                    'total' => $attractions->total(),
                    'page' => $attractions->currentPage(),
                    'limit' => $attractions->perPage(),
                    'pages' => $attractions->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Store a newly created tourist attraction.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'category' => 'required|string|max:50',
            'images' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 400);
        }
        
        $attraction = TouristAttraction::create($request->all());
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'attraction' => $attraction,
            ],
        ], 201);
    }

    /**
     * Display the specified tourist attraction.
     */
    public function show(TouristAttraction $touristAttraction): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'attraction' => $touristAttraction,
            ],
        ]);
    }

    /**
     * Update the specified tourist attraction.
     */
    public function update(Request $request, TouristAttraction $touristAttraction): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'address' => 'sometimes|string',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'category' => 'sometimes|string|max:50',
            'images' => 'sometimes|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 400);
        }
        
        $touristAttraction->update($request->all());
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'attraction' => $touristAttraction,
            ],
        ]);
    }

    /**
     * Remove the specified tourist attraction.
     */
    public function destroy(TouristAttraction $touristAttraction): JsonResponse
    {
        $touristAttraction->delete();
        
        return response()->json([
            'status' => 'success',
            'data' => null,
        ]);
    }
}
