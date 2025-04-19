<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use App\Models\ItineraryDay;
use App\Models\ItineraryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ItineraryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $itineraries = Auth::user()->itineraries()
            ->with(['days.items'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $itineraries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days' => 'required|array',
            'days.*.date' => 'required|date',
            'days.*.items' => 'array',
            'days.*.items.*.attraction' => 'required|string|max:255',
            'days.*.items.*.time' => 'nullable|string|max:50',
            'days.*.items.*.notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create itinerary
            $itinerary = Itinerary::create([
                'user_id' => Auth::id(),
                'title' => $request->title,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_public' => $request->is_public ?? false,
            ]);

            // Create days and items
            foreach ($request->days as $dayIndex => $dayData) {
                $day = ItineraryDay::create([
                    'itinerary_id' => $itinerary->id,
                    'date' => $dayData['date'],
                    'day_number' => $dayIndex + 1,
                ]);

                // Create items for this day
                if (isset($dayData['items']) && is_array($dayData['items'])) {
                    foreach ($dayData['items'] as $itemIndex => $itemData) {
                        ItineraryItem::create([
                            'itinerary_day_id' => $day->id,
                            'attraction' => $itemData['attraction'],
                            'time' => $itemData['time'] ?? null,
                            'notes' => $itemData['notes'] ?? null,
                            'order' => $itemIndex + 1,
                        ]);
                    }
                }
            }

            DB::commit();

            // Load the created itinerary with its relationships
            $itinerary->load('days.items');

            return response()->json([
                'status' => 'success',
                'data' => $itinerary,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create itinerary: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $itinerary = Itinerary::with('days.items')
            ->where('id', $id)
            ->where(function ($query) {
                $query->where('user_id', Auth::id())
                    ->orWhere('is_public', true);
            })
            ->first();

        if (!$itinerary) {
            return response()->json([
                'status' => 'error',
                'message' => 'Itinerary not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $itinerary,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $itinerary = Itinerary::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$itinerary) {
            return response()->json([
                'status' => 'error',
                'message' => 'Itinerary not found or you do not have permission to update it',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days' => 'required|array',
            'days.*.date' => 'required|date',
            'days.*.items' => 'array',
            'days.*.items.*.attraction' => 'required|string|max:255',
            'days.*.items.*.time' => 'nullable|string|max:50',
            'days.*.items.*.notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update itinerary
            $itinerary->update([
                'title' => $request->title,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_public' => $request->is_public ?? $itinerary->is_public,
            ]);

            // Delete existing days and items
            $itinerary->days()->delete();

            // Create new days and items
            foreach ($request->days as $dayIndex => $dayData) {
                $day = ItineraryDay::create([
                    'itinerary_id' => $itinerary->id,
                    'date' => $dayData['date'],
                    'day_number' => $dayIndex + 1,
                ]);

                // Create items for this day
                if (isset($dayData['items']) && is_array($dayData['items'])) {
                    foreach ($dayData['items'] as $itemIndex => $itemData) {
                        ItineraryItem::create([
                            'itinerary_day_id' => $day->id,
                            'attraction' => $itemData['attraction'],
                            'time' => $itemData['time'] ?? null,
                            'notes' => $itemData['notes'] ?? null,
                            'order' => $itemIndex + 1,
                        ]);
                    }
                }
            }

            DB::commit();

            // Load the updated itinerary with its relationships
            $itinerary->load('days.items');

            return response()->json([
                'status' => 'success',
                'data' => $itinerary,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update itinerary: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $itinerary = Itinerary::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$itinerary) {
            return response()->json([
                'status' => 'error',
                'message' => 'Itinerary not found or you do not have permission to delete it',
            ], 404);
        }

        $itinerary->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Itinerary deleted successfully',
        ]);
    }
}
