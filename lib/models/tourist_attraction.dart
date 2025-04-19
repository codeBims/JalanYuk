class TouristAttraction {
  final int id;
  final String name;
  final String description;
  final String address;
  final double latitude;
  final double longitude;
  final String category;
  final List<String> images;
  final double avgRating;
  final int totalReviews;

  TouristAttraction({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.category,
    required this.images,
    required this.avgRating,
    required this.totalReviews,
  });

  factory TouristAttraction.fromJson(Map<String, dynamic> json) {
    return TouristAttraction(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      address: json['address'],
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      category: json['category'],
      images: List<String>.from(json['images'] ?? []),
      avgRating: json['avg_rating'].toDouble(),
      totalReviews: json['total_reviews'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'category': category,
      'images': images,
      'avg_rating': avgRating,
      'total_reviews': totalReviews,
    };
  }
}
