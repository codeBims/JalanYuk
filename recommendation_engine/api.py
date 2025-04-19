from flask import Flask, request, jsonify
from main import TouristAttractionRecommender
import logging
import os
import json
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize recommender
recommender = TouristAttractionRecommender()

# Database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        if connection.is_connected():
            logger.info("Connected to MySQL database")
            return connection
    except Error as e:
        logger.error(f"Error connecting to MySQL database: {e}")
        return None

# Load data on startup
@app.before_first_request
def load_data():
    # Try to load from database
    connection = get_db_connection()
    if connection:
        recommender.db_connection = connection
        success = recommender.load_data_from_db()
        if success:
            logger.info("Data loaded from database")
            return
        
    # If database loading fails, try loading from files
    logger.info("Trying to load data from files")
    data_dir = os.getenv('DATA_DIR', 'data')
    attractions_file = os.path.join(data_dir, 'attractions.json')
    preferences_file = os.path.join(data_dir, 'preferences.json')
    reviews_file = os.path.join(data_dir, 'reviews.json')
    
    if (os.path.exists(attractions_file) and 
        os.path.exists(preferences_file) and 
        os.path.exists(reviews_file)):
        success = recommender.load_data_from_files(
            attractions_file,
            preferences_file,
            reviews_file
        )
        if success:
            logger.info("Data loaded from files")
            return
    
    logger.error("Failed to load data")

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        user_id = request.args.get('user_id', type=int)
        limit = request.args.get('limit', default=5, type=int)
        
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'User ID is required'
            }), 400
        
        recommendations = recommender.get_hybrid_recommendations(user_id, top_n=limit)
        
        return jsonify({
            'status': 'success',
            'data': {
                'recommendations': recommendations,
                'type': 'hybrid'
            }
        })
    
    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching recommendations'
        }), 500

@app.route('/api/recommendations/content-based', methods=['GET'])
def get_content_based_recommendations():
    try:
        user_id = request.args.get('user_id', type=int)
        limit = request.args.get('limit', default=5, type=int)
        
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'User ID is required'
            }), 400
        
        recommendations = recommender.get_content_based_recommendations(user_id, top_n=limit)
        
        return jsonify({
            'status': 'success',
            'data': {
                'recommendations': recommendations,
                'type': 'content_based'
            }
        })
    
    except Exception as e:
        logger.error(f"Error in get_content_based_recommendations: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching content-based recommendations'
        }), 500

@app.route('/api/recommendations/collaborative', methods=['GET'])
def get_collaborative_recommendations():
    try:
        user_id = request.args.get('user_id', type=int)
        limit = request.args.get('limit', default=5, type=int)
        
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'User ID is required'
            }), 400
        
        recommendations = recommender.get_collaborative_recommendations(user_id, top_n=limit)
        
        return jsonify({
            'status': 'success',
            'data': {
                'recommendations': recommendations,
                'type': 'collaborative'
            }
        })
    
    except Exception as e:
        logger.error(f"Error in get_collaborative_recommendations: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching collaborative recommendations'
        }), 500

@app.route('/api/itinerary/generate', methods=['POST'])
def generate_itinerary():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        required_fields = ['user_id', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Field {field} is required'
                }), 400
        
        user_id = data['user_id']
        start_date = data['start_date']
        end_date = data['end_date']
        location = data.get('location')
        
        itinerary = recommender.generate_itinerary(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            location=location
        )
        
        return jsonify({
            'status': 'success',
            'data': {
                'itinerary': itinerary
            }
        })
    
    except Exception as e:
        logger.error(f"Error in generate_itinerary: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while generating itinerary'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': 'Recommendation API is running'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
