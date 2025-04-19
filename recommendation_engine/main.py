import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import logging
import json
import os
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TouristAttractionRecommender:
    def __init__(self, db_connection=None):
        """
        Initialize the recommender system
        
        Args:
            db_connection: Database connection object (optional)
        """
        self.db_connection = db_connection
        self.attractions_df = None
        self.user_preferences_df = None
        self.reviews_df = None
        self.user_attraction_matrix = None
        logger.info("Recommender system initialized")
    
    def load_data_from_db(self):
        """
        Load data from database into pandas DataFrames
        """
        if not self.db_connection:
            logger.error("No database connection provided")
            return False
        
        try:
            # Load tourist attractions
            attractions_query = """
                SELECT id, name, description, address, latitude, longitude, 
                       category, images, avg_rating, total_reviews
                FROM tourist_attractions
            """
            self.attractions_df = pd.read_sql(attractions_query, self.db_connection)
            
            # Load user preferences
            preferences_query = """
                SELECT user_id, preferred_categories, avoided_categories, 
                       budget_level, activity_level
                FROM user_preferences
            """
            self.user_preferences_df = pd.read_sql(preferences_query, self.db_connection)
            
            # Load reviews
            reviews_query = """
                SELECT user_id, tourist_attraction_id, rating, comment
                FROM reviews
            """
            self.reviews_df = pd.read_sql(reviews_query, self.db_connection)
            
            # Create user-attraction matrix
            self._create_user_attraction_matrix()
            
            logger.info(f"Data loaded successfully: {len(self.attractions_df)} attractions, "
                       f"{len(self.user_preferences_df)} user preferences, "
                       f"{len(self.reviews_df)} reviews")
            return True
        
        except Exception as e:
            logger.error(f"Error loading data from database: {str(e)}")
            return False
    
    def load_data_from_files(self, attractions_file, preferences_file, reviews_file):
        """
        Load data from JSON files into pandas DataFrames
        
        Args:
            attractions_file: Path to attractions JSON file
            preferences_file: Path to user preferences JSON file
            reviews_file: Path to reviews JSON file
        """
        try:
            # Load tourist attractions
            with open(attractions_file, 'r') as f:
                attractions_data = json.load(f)
            self.attractions_df = pd.DataFrame(attractions_data)
            
            # Load user preferences
            with open(preferences_file, 'r') as f:
                preferences_data = json.load(f)
            self.user_preferences_df = pd.DataFrame(preferences_data)
            
            # Load reviews
            with open(reviews_file, 'r') as f:
                reviews_data = json.load(f)
            self.reviews_df = pd.DataFrame(reviews_data)
            
            # Create user-attraction matrix
            self._create_user_attraction_matrix()
            
            logger.info(f"Data loaded successfully from files: {len(self.attractions_df)} attractions, "
                       f"{len(self.user_preferences_df)} user preferences, "
                       f"{len(self.reviews_df)} reviews")
            return True
        
        except Exception as e:
            logger.error(f"Error loading data from files: {str(e)}")
            return False
    
    def _create_user_attraction_matrix(self):
        """
        Create a matrix of users and their ratings for attractions
        """
        if self.reviews_df is None:
            logger.warning("Reviews data not loaded")
            return None
        
        # Pivot the reviews dataframe to create a user-attraction matrix
        try:
            self.user_attraction_matrix = self.reviews_df.pivot(
                index='user_id',
                columns='tourist_attraction_id',
                values='rating'
            ).fillna(0)
            
            logger.info(f"User-attraction matrix created with shape: {self.user_attraction_matrix.shape}")
        except Exception as e:
            logger.error(f"Error creating user-attraction matrix: {str(e)}")
    
    def get_content_based_recommendations(self, user_id, top_n=5):
        """
        Generate content-based recommendations based on user preferences
        
        Args:
            user_id: User ID
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended attractions
        """
        if self.attractions_df is None or self.user_preferences_df is None:
            logger.error("Data not loaded")
            return []
        
        try:
            # Get user preferences
            user_prefs = self.user_preferences_df[self.user_preferences_df['user_id'] == user_id]
            
            if len(user_prefs) == 0:
                logger.warning(f"No preferences found for user {user_id}")
                return []
            
            # Extract preferred categories
            preferred_categories = user_prefs['preferred_categories'].iloc[0]
            if isinstance(preferred_categories, str):
                preferred_categories = preferred_categories.split(',')
            
            # Extract avoided categories
            avoided_categories = user_prefs['avoided_categories'].iloc[0]
            if isinstance(avoided_categories, str):
                avoided_categories = avoided_categories.split(',')
            elif avoided_categories is None:
                avoided_categories = []
            
            # Filter attractions by preferred categories and exclude avoided categories
            filtered_attractions = self.attractions_df[
                (self.attractions_df['category'].isin(preferred_categories)) &
                (~self.attractions_df['category'].isin(avoided_categories))
            ]
            
            # Sort by rating and return top N
            recommended_attractions = filtered_attractions.sort_values(
                by='avg_rating', ascending=False
            ).head(top_n)
            
            logger.info(f"Generated {len(recommended_attractions)} content-based recommendations for user {user_id}")
            return recommended_attractions.to_dict('records')
        
        except Exception as e:
            logger.error(f"Error generating content-based recommendations: {str(e)}")
            return []
    
    def get_collaborative_recommendations(self, user_id, top_n=5):
        """
        Generate collaborative filtering recommendations based on similar users
        
        Args:
            user_id: User ID
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended attractions
        """
        if self.user_attraction_matrix is None:
            logger.error("User-attraction matrix not created")
            return []
        
        try:
            if user_id not in self.user_attraction_matrix.index:
                logger.warning(f"User {user_id} not found in the matrix")
                return []
            
            # Calculate similarity between users
            user_similarity = cosine_similarity(self.user_attraction_matrix)
            user_similarity_df = pd.DataFrame(
                user_similarity,
                index=self.user_attraction_matrix.index,
                columns=self.user_attraction_matrix.index
            )
            
            # Get similar users
            similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:6]
            
            # Get attractions rated highly by similar users but not visited by the current user
            user_attractions = set(self.reviews_df[self.reviews_df['user_id'] == user_id]['tourist_attraction_id'])
            
            recommended_attractions = []
            for similar_user_id in similar_users.index:
                similar_user_attractions = self.reviews_df[
                    (self.reviews_df['user_id'] == similar_user_id) &
                    (self.reviews_df['rating'] >= 4)
                ]['tourist_attraction_id']
                
                for attraction_id in similar_user_attractions:
                    if attraction_id not in user_attractions:
                        attraction_data = self.attractions_df[
                            self.attractions_df['id'] == attraction_id
                        ]
                        if not attraction_data.empty:
                            recommended_attractions.append(attraction_data.iloc[0].to_dict())
                            if len(recommended_attractions) >= top_n:
                                break
                
                if len(recommended_attractions) >= top_n:
                    break
            
            logger.info(f"Generated {len(recommended_attractions)} collaborative recommendations for user {user_id}")
            return recommended_attractions
        
        except Exception as e:
            logger.error(f"Error generating collaborative recommendations: {str(e)}")
            return []
    
    def get_hybrid_recommendations(self, user_id, top_n=10):
        """
        Generate hybrid recommendations combining content-based and collaborative filtering
        
        Args:
            user_id: User ID
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended attractions
        """
        try:
            # Get content-based recommendations
            content_recs = self.get_content_based_recommendations(user_id, top_n=top_n//2)
            
            # Get collaborative recommendations
            collab_recs = self.get_collaborative_recommendations(user_id, top_n=top_n//2)
            
            # Combine recommendations
            hybrid_recs = content_recs + collab_recs
            
            # Remove duplicates
            seen = set()
            unique_recs = []
            for rec in hybrid_recs:
                if rec['id'] not in seen:
                    seen.add(rec['id'])
                    unique_recs.append(rec)
            
            logger.info(f"Generated {len(unique_recs)} hybrid recommendations for user {user_id}")
            return unique_recs[:top_n]
        
        except Exception as e:
            logger.error(f"Error generating hybrid recommendations: {str(e)}")
            return []
    
    def generate_itinerary(self, user_id, start_date, end_date, location=None):
        """
        Generate an itinerary based on user preferences and dates
        
        Args:
            user_id: User ID
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            location: Optional location filter
            
        Returns:
            Dictionary containing itinerary details
        """
        try:
            # Get recommendations for the user
            recommended_attractions = self.get_hybrid_recommendations(user_id, top_n=20)
            
            if not recommended_attractions:
                logger.warning(f"No recommendations found for user {user_id}")
                return {}
            
            # Filter by location if provided
            if location:
                recommended_attractions = [
                    attr for attr in recommended_attractions 
                    if location.lower() in attr['address'].lower()
                ]
            
            # Calculate number of days
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
            num_days = (end - start).days + 1
            
            # Create itinerary
            itinerary = {
                'user_id': user_id,
                'title': f'Perjalanan {start_date} hingga {end_date}',
                'description': 'Itinerary yang dibuat otomatis oleh sistem rekomendasi',
                'start_date': start_date,
                'end_date': end_date,
                'days': []
            }
            
            attractions_per_day = min(3, len(recommended_attractions) // num_days)
            
            for day in range(num_days):
                current_date = start + timedelta(days=day)
                
                day_plan = {
                    'day': day + 1,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'attractions': []
                }
                
                # Morning, afternoon, evening slots
                time_slots = ['09:00 - 11:00', '13:00 - 15:00', '16:00 - 18:00']
                
                day_attractions = recommended_attractions[day*attractions_per_day:(day+1)*attractions_per_day]
                
                for i, attraction in enumerate(day_attractions):
                    day_plan['attractions'].append({
                        'attraction_id': attraction['id'],
                        'name': attraction['name'],
                        'time_slot': time_slots[i] if i < len(time_slots) else '19:00 - 21:00',
                        'notes': f"Kunjungan ke {attraction['name']}",
                        'category': attraction['category'],
                        'address': attraction['address'],
                        'latitude': attraction['latitude'],
                        'longitude': attraction['longitude']
                    })
                
                itinerary['days'].append(day_plan)
            
            logger.info(f"Generated itinerary for user {user_id} from {start_date} to {end_date}")
            return itinerary
        
        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            return {}

# Example usage
if __name__ == "__main__":
    # Sample data
    attractions_data = [
        {'id': 1, 'name': 'Pantai Kuta', 'description': 'Pantai terkenal di Bali', 
         'address': 'Kuta, Bali', 'latitude': -8.7184, 'longitude': 115.1686,
         'category': 'Pantai', 'images': [], 'avg_rating': 4.7, 'total_reviews': 1240},
        {'id': 2, 'name': 'Tanah Lot', 'description': 'Pura di atas batu karang', 
         'address': 'Tabanan, Bali', 'latitude': -8.6215, 'longitude': 115.0865,
         'category': 'Budaya', 'images': [], 'avg_rating': 4.8, 'total_reviews': 2100},
        {'id': 3, 'name': 'Ubud Monkey Forest', 'description': 'Hutan dengan kera', 
         'address': 'Ubud, Bali', 'latitude': -8.5195, 'longitude': 115.2587,
         'category': 'Alam', 'images': [], 'avg_rating': 4.5, 'total_reviews': 980}
    ]
    
    user_preferences_data = [
        {'user_id': 1, 'preferred_categories': ['Pantai', 'Budaya'], 
         'avoided_categories': ['Belanja'], 'budget_level': 2, 'activity_level': 3},
        {'user_id': 2, 'preferred_categories': ['Alam', 'Budaya'], 
         'avoided_categories': ['Kuliner'], 'budget_level': 1, 'activity_level': 2}
    ]
    
    reviews_data = [
        {'user_id': 1, 'tourist_attraction_id': 1, 'rating': 5, 'comment': 'Bagus!'},
        {'user_id': 1, 'tourist_attraction_id': 2, 'rating': 4, 'comment': 'Indah'},
        {'user_id': 2, 'tourist_attraction_id': 2, 'rating': 5, 'comment': 'Menakjubkan'},
        {'user_id': 2, 'tourist_attraction_id': 3, 'rating': 4, 'comment': 'Seru'}
    ]
    
    # Save sample data to JSON files
    os.makedirs('data', exist_ok=True)
    
    with open('data/attractions.json', 'w') as f:
        json.dump(attractions_data, f)
    
    with open('data/preferences.json', 'w') as f:
        json.dump(user_preferences_data, f)
    
    with open('data/reviews.json', 'w') as f:
        json.dump(reviews_data, f)
    
    # Initialize recommender
    recommender = TouristAttractionRecommender()
    
    # Load data from files
    recommender.load_data_from_files(
        'data/attractions.json',
        'data/preferences.json',
        'data/reviews.json'
    )
    
    # Get recommendations
    content_recs = recommender.get_content_based_recommendations(user_id=1)
    print("\nContent-based recommendations:")
    for rec in content_recs:
        print(f"- {rec['name']} (Rating: {rec['avg_rating']})")
    
    collab_recs = recommender.get_collaborative_recommendations(user_id=1)
    print("\nCollaborative recommendations:")
    for rec in collab_recs:
        print(f"- {rec['name']} (Rating: {rec['avg_rating']})")
    
    # Generate itinerary
    itinerary = recommender.generate_itinerary(
        user_id=1, 
        start_date='2023-04-01', 
        end_date='2023-04-03', 
        location='Bali'
    )
    
    print("\nGenerated Itinerary:")
    for day in itinerary['days']:
        print(f"Day {day['day']} - {day['date']}")
        for attraction in day['attractions']:
            print(f"  {attraction['time_slot']} - {attraction['name']}")
