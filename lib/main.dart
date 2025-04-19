import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:jalanyuk/blocs/auth/auth_bloc.dart';
import 'package:jalanyuk/blocs/tourist_attraction/tourist_attraction_bloc.dart';
import 'package:jalanyuk/blocs/itinerary/itinerary_bloc.dart';
import 'package:jalanyuk/repositories/auth_repository.dart';
import 'package:jalanyuk/repositories/tourist_attraction_repository.dart';
import 'package:jalanyuk/repositories/itinerary_repository.dart';
import 'package:jalanyuk/screens/splash_screen.dart';
import 'package:jalanyuk/utils/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(
          create: (context) => AuthRepository(),
        ),
        RepositoryProvider(
          create: (context) => TouristAttractionRepository(),
        ),
        RepositoryProvider(
          create: (context) => ItineraryRepository(),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthBloc(
              authRepository: context.read<AuthRepository>(),
            ),
          ),
          BlocProvider(
            create: (context) => TouristAttractionBloc(
              touristAttractionRepository: context.read<TouristAttractionRepository>(),
            ),
          ),
          BlocProvider(
            create: (context) => ItineraryBloc(
              itineraryRepository: context.read<ItineraryRepository>(),
            ),
          ),
        ],
        child: MaterialApp(
          title: 'JalanYuk',
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.system,
          debugShowCheckedModeBanner: false,
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
