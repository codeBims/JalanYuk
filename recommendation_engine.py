import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

class TouristAttractionRecommender:
    def __init__(self):
        # Dalam implementasi nyata, data akan diambil dari database
        self.attractions_df = None
        self.user_preferences_df = None
        self.reviews_df = None
        self.user_attraction_matrix = None
    
    def load_data(self, attractions_data, user_preferences_data, reviews_data):
        """
        Load data from database into pandas DataFrames
        """
        self.attractions_df = pd.DataFrame(attractions_data)
        self.user_preferences_df = pd.DataFrame(user_preferences_data)
        self.reviews_df = pd.DataFrame(reviews_data)
        
        # Create user-attraction matrix for collaborative filtering
        self.user_attraction_matrix = self._create_user_attraction_matrix()
        
        print("Data loaded successfully")
        print(f"Number of attractions: {len(self.attractions_df)}")
        print(f"Number of users: {len(self.user_preferences_df)}")
        print(f"Number of reviews: {len(self.reviews_df)}")
    
    def _create_user_attraction_matrix(self):
        """
        Create a matrix of users and their ratings for attractions
        """
        if self.reviews_df is None:
            return None
        
        # Pivot the reviews dataframe to create a user-attraction matrix
        user_attraction_matrix = self.reviews_df.pivot(
            index='user_id',
            columns='attraction_id',
            values='rating'
        ).fillna(0)
        
        return user_attraction_matrix
    
    def get_content_based_recommendations(self, user_id, top_n=5):
        """
        Generate content-based recommendations based on user preferences
        """
        if self.attractions_df is None or self.user_preferences_df is None:
            print("Data not loaded")
            return []
        
        # Get user preferences
        user_prefs = self.user_preferences_df[self.user_preferences_df['user_id'] == user_id]
        
        if len(user_prefs) == 0:
            print(f"No preferences found for user {user_id}")
            return []
        
        # Extract preferred categories
        preferred_categories = user_prefs['preferred_categories'].iloc[0].split(',')
        
        # Filter attractions by preferred categories
        filtered_attractions = self.attractions_df[
            self.attractions_df['category'].isin(preferred_categories)
        ]
        
        # Sort by rating and return top N
        recommended_attractions = filtered_attractions.sort_values(
            by='avg_rating', ascending=False
        ).head(top_n)
        
        return recommended_attractions.to_dict('records')
    
    def get_collaborative_recommendations(self, user_id, top_n=5):
        """
        Generate collaborative filtering recommendations based on similar users
        """
        if self.user_attraction_matrix is None:
            print("User-attraction matrix not created")
            return []
        
        if user_id not in self.user_attraction_matrix.index:
            print(f"User {user_id} not found in the matrix")
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
        user_attractions = set(self.reviews_df[self.reviews_df['user_id'] == user_id]['attraction_id'])
        
        recommended_attractions = []
        for similar_user_id in similar_users.index:
            similar_user_attractions = self.reviews_df[
                (self.reviews_df['user_id'] == similar_user_id) &
                (self.reviews_df['rating'] >= 4)
            ]['attraction_id']
            
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
        
        return recommended_attractions
    
    def get_hybrid_recommendations(self, user_id, top_n=10):
        """
        Generate hybrid recommendations combining content-based and collaborative filtering
        """
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
        
        return unique_recs[:top_n]
    
    def generate_itinerary(self, user_id, start_date, end_date, location=None):
        """
        Generate an itinerary based on user preferences and dates
        """
        # Get recommendations for the user
        recommended_attractions = self.get_hybrid_recommendations(user_id, top_n=20)
        
        if not recommended_attractions:
            return []
        
        # Filter by location if provided
        if location:
            recommended_attractions = [
                attr for attr in recommended_attractions 
                if location.lower() in attr['address'].lower()
            ]
        
        # Calculate number of days
        from datetime import datetime
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        num_days = (end - start).days + 1
        
        # Create itinerary
        itinerary = []
        attractions_per_day = min(3, len(recommended_attractions) // num_days)
        
        for day in range(num_days):
            day_attractions = recommended_attractions[day*attractions_per_day:(day+1)*attractions_per_day]
            
            day_plan = {
                'day': day + 1,
                'date': (start + pd.Timedelta(days=day)).strftime('%Y-%m-%d'),
                'attractions': []
            }
            
            # Morning, afternoon, evening slots
            time_slots = ['09:00 - 11:00', '13:00 - 15:00', '16:00 - 18:00']
            
            for i, attraction in enumerate(day_attractions):
                day_plan['attractions'].append({
                    'attraction_id': attraction['id'],
                    'name': attraction['name'],
                    'time_slot': time_slots[i] if i < len(time_slots) else '19:00 - 21:00',
                    'notes': f"Kunjungan ke {attraction['name']}"
                })
            
            itinerary.append(day_plan)
        
        return itinerary

# Contoh penggunaan
if __name__ == "__main__":
    # Sample data
    attractions_data = [
        {'id': 1, 'name': 'Pantai Kuta', 'description': 'Pantai terkenal di Bali', 
         'address': 'Kuta, Bali', 'category': 'Pantai', 'avg_rating': 4.7},
        {'id': 2, 'name': 'Tanah Lot', 'description': 'Pura di atas batu karang', 
         'address': 'Tabanan, Bali', 'category': 'Budaya', 'avg_rating': 4.8},
        {'id': 3, 'name': 'Ubud Monkey Forest', 'description': 'Hutan dengan kera', 
         'address': 'Ubud, Bali', 'category': 'Alam', 'avg_rating': 4.5}
    ]
    
    user_preferences_data = [
        {'user_id': 1, 'preferred_categories': 'Pantai,Budaya', 'avoided_categories': 'Belanja'},
        {'user_id': 2, 'preferred_categories': 'Alam,Budaya', 'avoided_categories': 'Kuliner'}
    ]
    
    reviews_data = [
        {'user_id': 1, 'attraction_id': 1, 'rating': 5},
        {'user_id': 1, 'attraction_id': 2, 'rating': 4},
        {'user_id': 2, 'attraction_id': 2, 'rating': 5},
        {'user_id': 2, 'attraction_id': 3, 'rating': 4}
    ]
    
    # Initialize recommender
    recommender = TouristAttractionRecommender()
    
    # Load data
    recommender.load_data(attractions_data, user_preferences_data, reviews_data)
    
    # Get content-based recommendations
    content_recs = recommender.get_content_based_recommendations(user_id=1)
    print("\nContent-based recommendations:")
    for rec in content_recs:
        print(f"- {rec['name']} (Rating: {rec['avg_rating']})")
    
    # Get collaborative recommendations
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
    for day in itinerary:
        print(f"Day {day['day']} - {day['date']}")
        for attraction in day['attractions']:
            print(f"  {attraction['time_slot']} - {attraction['name']}")
