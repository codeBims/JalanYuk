import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:jalanyuk/blocs/tourist_attraction/tourist_attraction_bloc.dart';
import 'package:jalanyuk/models/tourist_attraction.dart';
import 'package:jalanyuk/screens/explore_screen.dart';
import 'package:jalanyuk/screens/itinerary_screen.dart';
import 'package:jalanyuk/screens/profile_screen.dart';
import 'package:jalanyuk/widgets/attraction_card.dart';
import 'package:jalanyuk/widgets/category_chip.dart';
import 'package:jalanyuk/utils/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final List<String> categories = [
    'Semua',
    'Pantai',
    'Alam',
    'Budaya',
    'Kuliner',
    'Belanja',
  ];

  String selectedCategory = 'Semua';

  @override
  void initState() {
    super.initState();
    context.read<TouristAttractionBloc>().add(FetchTopRatedAttractions());
    context.read<TouristAttractionBloc>().add(FetchRecommendedAttractions());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // App Bar
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Halo, Traveler!',
                          style: AppTheme.headingStyle,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Mau jalan-jalan ke mana hari ini?',
                          style: AppTheme.captionStyle,
                        ),
                      ],
                    ),
                    CircleAvatar(
                      backgroundColor: AppTheme.primaryColor,
                      child: const Icon(
                        Icons.person,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),

              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Cari tempat wisata...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ExploreScreen(),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Categories
              Padding(
                padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
                child: Text(
                  'Kategori',
                  style: AppTheme.subheadingStyle,
                ),
              ),
              SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  itemCount: categories.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: CategoryChip(
                        label: categories[index],
                        isSelected: selectedCategory == categories[index],
                        onTap: () {
                          setState(() {
                            selectedCategory = categories[index];
                          });
                          // Filter attractions by category
                          if (selectedCategory == 'Semua') {
                            context.read<TouristAttractionBloc>().add(FetchTopRatedAttractions());
                          } else {
                            context.read<TouristAttractionBloc>().add(
                                  FetchAttractionsByCategory(selectedCategory),
                                );
                          }
                        },
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Top Rated Attractions
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Tempat Wisata Populer',
                      style: AppTheme.subheadingStyle,
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const ExploreScreen(),
                          ),
                        );
                      },
                      child: const Text('Lihat Semua'),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 280,
                child: BlocBuilder<TouristAttractionBloc, TouristAttractionState>(
                  builder: (context, state) {
                    if (state is TouristAttractionLoading) {
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    } else if (state is TopRatedAttractionsLoaded) {
                      return ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        itemCount: state.attractions.length,
                        itemBuilder: (context, index) {
                          final attraction = state.attractions[index];
                          return Padding(
                            padding: const EdgeInsets.only(right: 16.0),
                            child: SizedBox(
                              width: 200,
                              child: AttractionCard(
                                attraction: attraction,
                                onTap: () {
                                  // Navigate to attraction details
                                },
                              ),
                            ),
                          );
                        },
                      );
                    } else if (state is TouristAttractionError) {
                      return Center(
                        child: Text(
                          'Error: ${state.message}',
                          style: const TextStyle(color: AppTheme.errorColor),
                        ),
                      );
                    } else {
                      return const Center(
                        child: Text('No attractions found'),
                      );
                    }
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Recommended for You
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Rekomendasi untuk Anda',
                      style: AppTheme.subheadingStyle,
                    ),
                    TextButton(
                      onPressed: () {
                        // Navigate to recommendations screen
                      },
                      child: const Text('Lihat Semua'),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 280,
                child: BlocBuilder<TouristAttractionBloc, TouristAttractionState>(
                  builder: (context, state) {
                    if (state is TouristAttractionLoading) {
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    } else if (state is RecommendedAttractionsLoaded) {
                      return ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        itemCount: state.attractions.length,
                        itemBuilder: (context, index) {
                          final attraction = state.attractions[index];
                          return Padding(
                            padding: const EdgeInsets.only(right: 16.0),
                            child: SizedBox(
                              width: 200,
                              child: AttractionCard(
                                attraction: attraction,
                                onTap: () {
                                  // Navigate to attraction details
                                },
                              ),
                            ),
                          );
                        },
                      );
                    } else if (state is TouristAttractionError) {
                      return Center(
                        child: Text(
                          'Error: ${state.message}',
                          style: const TextStyle(color: AppTheme.errorColor),
                        ),
                      );
                    } else {
                      return const Center(
                        child: Text('No recommendations found'),
                      );
                    }
                  },
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        onTap: (index) {
          if (index == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const ExploreScreen(),
              ),
            );
          } else if (index == 2) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const ItineraryScreen(),
              ),
            );
          } else if (index == 3) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const ProfileScreen(),
              ),
            );
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.explore),
            label: 'Jelajahi',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Itinerary',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
