<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TouristAttraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'category',
        'images',
        'avg_rating',
        'total_reviews',
    ];

    protected $casts = [
        'images' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'avg_rating' => 'float',
    ];

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function itineraryItems(): HasMany
    {
        return $this->hasMany(ItineraryItem::class);
    }

    public function updateRating(): void
    {
        $reviews = $this->reviews;
        $totalReviews = $reviews->count();
        
        if ($totalReviews > 0) {
            $avgRating = $reviews->avg('rating');
            $this->update([
                'avg_rating' => $avgRating,
                'total_reviews' => $totalReviews,
            ]);
        }
    }
}
