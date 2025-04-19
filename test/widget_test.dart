import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jalanyuk/main.dart';
import 'package:jalanyuk/screens/home_screen.dart';
import 'package:jalanyuk/widgets/attraction_card.dart';
import 'package:jalanyuk/models/tourist_attraction.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:jalanyuk/blocs/tourist_attraction/tourist_attraction_bloc.dart';
import 'package:jalanyuk/repositories/tourist_attraction_repository.dart';

// Mock classes
class MockTouristAttractionRepository extends Mock implements TouristAttractionRepository {}
class MockTouristAttractionBloc extends Mock implements TouristAttractionBloc {}

void main() {
  group('Widget Tests', () {
    testWidgets('App renders correctly', (WidgetTester tester) async {
      // Build our app and trigger a frame
      await tester.pumpWidget(const MyApp());

      // Verify that the splash screen is shown
      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('AttractionCard renders correctly', (WidgetTester tester) async {
      // Create a sample attraction
      final attraction = TouristAttraction(
        id: 1,
        name: 'Pantai Kuta',
        description: 'Pantai terkenal di Bali',
        address: 'Kuta, Bali',
        latitude: -8.7184,
        longitude: 115.1686,
        category: 'Pantai',
        images: ['https://example.com/image.jpg'],
        avgRating: 4.7,
        totalReviews: 1240,
      );

      // Build the widget
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AttractionCard(
              attraction: attraction,
              onTap: () {},
            ),
          ),
        ),
      );

      // Verify that the card shows the correct information
      expect(find.text('Pantai Kuta'), findsOneWidget);
      expect(find.text('Kuta, Bali'), findsOneWidget);
      expect(find.text('4.7'), findsOneWidget);
    });

    testWidgets('HomeScreen shows loading state', (WidgetTester tester) async {
      // Create mock bloc
      final mockBloc = MockTouristAttractionBloc();
      
      // Set up the bloc to return loading state
      when(mockBloc.state).thenReturn(TouristAttractionLoading());
      
      // Build the widget with the mock bloc
      await tester.pumpWidget(
        MaterialApp(
          home: BlocProvider<TouristAttractionBloc>.value(
            value: mockBloc,
            child: const HomeScreen(),
          ),
        ),
      );

      // Verify that loading indicators are shown
      expect(find.byType(CircularProgressIndicator), findsWidgets);
    });

    testWidgets('HomeScreen shows attractions when loaded', (WidgetTester tester) async {
      // Create mock bloc
      final mockBloc = MockTouristAttractionBloc();
      
      // Create sample attractions
      final attractions = [
        TouristAttraction(
          id: 1,
          name: 'Pantai Kuta',
          description: 'Pantai terkenal di Bali',
          address: 'Kuta, Bali',
          latitude: -8.7184,
          longitude: 115.1686,
          category: 'Pantai',
          images: ['https://example.com/image.jpg'],
          avgRating: 4.7,
          totalReviews: 1240,
        ),
        TouristAttraction(
          id: 2,
          name: 'Tanah Lot',
          description: 'Pura di atas batu karang',
          address: 'Tabanan, Bali',
          latitude: -8.6215,
          longitude: 115.0865,
          category: 'Budaya',
          images: ['https://example.com/image.jpg'],
          avgRating: 4.8,
          totalReviews: 2100,
        ),
      ];
      
      // Set up the bloc to return loaded state
      when(mockBloc.state).thenReturn(TopRatedAttractionsLoaded(attractions));
      
      // Build the widget with the mock bloc
      await tester.pumpWidget(
        MaterialApp(
          home: BlocProvider<TouristAttractionBloc>.value(
            value: mockBloc,
            child: const HomeScreen(),
          ),
        ),
      );

      // Verify that attractions are shown
      expect(find.text('Pantai Kuta'), findsOneWidget);
      expect(find.text('Tanah Lot'), findsOneWidget);
    });
  });
}
