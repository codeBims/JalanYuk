<?php

namespace Tests\Feature;

use App\Models\TouristAttraction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TouristAttractionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test listing tourist attractions.
     */
    public function test_can_list_tourist_attractions()
    {
        // Create some test data
        TouristAttraction::factory()->count(5)->create();

        // Make request
        $response = $this->getJson('/api/tourist-attractions');

        // Assert response
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data' => [
                        'attractions',
                        'pagination' => [
                            'total',
                            'page',
                            'limit',
                            'pages'
                        ]
                    ]
                ])
                ->assertJsonCount(5, 'data.attractions')
                ->assertJson([
                    'status' => 'success'
                ]);
    }

    /**
     * Test filtering tourist attractions by category.
     */
    public function test_can_filter_attractions_by_category()
    {
        // Create test data with different categories
        TouristAttraction::factory()->count(3)->create(['category' => 'Pantai']);
        TouristAttraction::factory()->count(2)->create(['category' => 'Alam']);

        // Make request with category filter
        $response = $this->getJson('/api/tourist-attractions?category=Pantai');

        // Assert response
        $response->assertStatus(200)
                ->assertJsonCount(3, 'data.attractions')
                ->assertJson([
                    'status' => 'success'
                ]);
    }

    /**
     * Test searching tourist attractions.
     */
    public function test_can_search_attractions()
    {
        // Create test data
        TouristAttraction::factory()->create([
            'name' => 'Pantai Kuta',
            'description' => 'Pantai terkenal di Bali'
        ]);
        TouristAttraction::factory()->create([
            'name' => 'Tanah Lot',
            'description' => 'Pura di atas batu karang'
        ]);

        // Make request with search query
        $response = $this->getJson('/api/tourist-attractions?query=Kuta');

        // Assert response
        $response->assertStatus(200)
                ->assertJsonCount(1, 'data.attractions')
                ->assertJson([
                    'status' => 'success',
                    'data' => [
                        'attractions' => [
                            [
                                'name' => 'Pantai Kuta'
                            ]
                        ]
                    ]
                ]);
    }

    /**
     * Test creating a tourist attraction.
     */
    public function test_admin_can_create_tourist_attraction()
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'admin']);

        // Data for new attraction
        $attractionData = [
            'name' => 'Pantai Baru',
            'description' => 'Pantai indah dengan pasir putih',
            'address' => 'Jl. Pantai Baru, Bali',
            'latitude' => -8.7184,
            'longitude' => 115.1686,
            'category' => 'Pantai',
            'images' => ['image1.jpg', 'image2.jpg']
        ];

        // Make request as admin
        $response = $this->actingAs($admin)
                        ->postJson('/api/tourist-attractions', $attractionData);

        // Assert response
        $response->assertStatus(201)
                ->assertJson([
                    'status' => 'success',
                    'data' => [
                        'attraction' => [
                            'name' => 'Pantai Baru',
                            'category' => 'Pantai'
                        ]
                    ]
                ]);

        // Assert data was saved to database
        $this->assertDatabaseHas('tourist_attractions', [
            'name' => 'Pantai Baru',
            'category' => 'Pantai'
        ]);
    }

    /**
     * Test non-admin cannot create a tourist attraction.
     */
    public function test_non_admin_cannot_create_tourist_attraction()
    {
        // Create regular user
        $user = User::factory()->create(['role' => 'user']);

        // Data for new attraction
        $attractionData = [
            'name' => 'Pantai Baru',
            'description' => 'Pantai indah dengan pasir putih',
            'address' => 'Jl. Pantai Baru, Bali',
            'latitude' => -8.7184,
            'longitude' => 115.1686,
            'category' => 'Pantai',
            'images' => ['image1.jpg', 'image2.jpg']
        ];

        // Make request as regular user
        $response = $this->actingAs($user)
                        ->postJson('/api/tourist-attractions', $attractionData);

        // Assert response
        $response->assertStatus(403);

        // Assert data was not saved to database
        $this->assertDatabaseMissing('tourist_attractions', [
            'name' => 'Pantai Baru'
        ]);
    }

    /**
     * Test viewing a specific tourist attraction.
     */
    public function test_can_view_tourist_attraction()
    {
        // Create test data
        $attraction = TouristAttraction::factory()->create();

        // Make request
        $response = $this->getJson("/api/tourist-attractions/{$attraction->id}");

        // Assert response
        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'data' => [
                        'attraction' => [
                            'id' => $attraction->id,
                            'name' => $attraction->name
                        ]
                    ]
                ]);
    }

    /**
     * Test updating a tourist attraction.
     */
    public function test_admin_can_update_tourist_attraction()
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'admin']);

        // Create test data
        $attraction = TouristAttraction::factory()->create();

        // Update data
        $updateData = [
            'name' => 'Updated Name',
            'description' => 'Updated description'
        ];

        // Make request as admin
        $response = $this->actingAs($admin)
                        ->putJson("/api/tourist-attractions/{$attraction->id}", $updateData);

        // Assert response
        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'data' => [
                        'attraction' => [
                            'id' => $attraction->id,
                            'name' => 'Updated Name',
                            'description' => 'Updated description'
                        ]
                    ]
                ]);

        // Assert data was updated in database
        $this->assertDatabaseHas('tourist_attractions', [
            'id' => $attraction->id,
            'name' => 'Updated Name',
            'description' => 'Updated description'
        ]);
    }

    /**
     * Test deleting a tourist attraction.
     */
    public function test_admin_can_delete_tourist_attraction()
    {
        // Create admin user
        $admin = User::factory()->create(['role' => 'admin']);

        // Create test data
        $attraction = TouristAttraction::factory()->create();

        // Make request as admin
        $response = $this->actingAs($admin)
                        ->deleteJson("/api/tourist-attractions/{$attraction->id}");

        // Assert response
        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success'
                ]);

        // Assert data was deleted from database
        $this->assertDatabaseMissing('tourist_attractions', [
            'id' => $attraction->id
        ]);
    }
}
