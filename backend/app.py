from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import os
import logging
import requests
from datetime import time

GOOGLE_MAPS_API_KEY=os.environ['GOOGLE_MAPS_API_KEY']


# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'db'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT')
    )
    return conn
def get_coordinates(address):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_MAPS_API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            location = data['results'][0]['geometry']['location']
            return location['lat'], location['lng']
        else:
            logging.error(f"Geocoding failed with status: {data['status']}")
    return None, None

@app.route('/jobs', methods=['GET'])
def get_jobs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                j.job_id, 
                j.address, 
                ST_X(j.coordinates::geometry) AS longitude,
                ST_Y(j.coordinates::geometry) AS latitude,
                j.duration, 
                j.tasks, 
                j.date, 
                j.start_time, 
                j.validated, 
                pc.postal_code, 
                c.city_name, 
                s.state_name
            FROM 
                jobs j
            JOIN 
                postal_codes pc ON j.postal_code_id = pc.postal_code_id
            JOIN 
                cities c ON pc.city_id = c.city_id
            JOIN 
                states s ON c.state_id = s.state_id
            ORDER BY 
                j.date ASC  -- Sort by date
        ''')
        jobs = cursor.fetchall()
        cursor.close()
        conn.close()

        jobs_list = []
        for job in jobs:
            jobs_list.append({
                'job_id': job[0],
                'address': job[1],
                'latitude': job[2],
                'longitude': job[3],
                'duration': job[4],
                'tasks': job[5].split(','),  # Convert tasks string back to a list
                'date': job[6].isoformat(),  # Convert date to string
                'start_time': job[7].strftime('%H:%M:%S') if isinstance(job[6], time) else job[6],  # Convert time to string
                'validated': job[8],
                'postal_code': job[9],
                'city_name': job[10],
                'state_name': job[11]
            })

        return jsonify(jobs_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Catch and return any errors

@app.route('/jobs', methods=['POST'])

def add_job():
    try:
        new_job = request.json
        address = new_job['address']
        duration = new_job['duration']
        tasks = ','.join(new_job['tasks'])  # Join tasks into a comma-separated string
        date = new_job.get('date')
        start_time = new_job.get('start_time')
        postal_code = new_job['postal_code']
        # Set default city and state
        city_name = new_job.get('city_name')
        state_name = new_job.get('state_name')

        validated = new_job.get('validated', False)

        full_address = f"{address}, {city_name}, {state_name}, {postal_code}"
        latitude, longitude = get_coordinates(full_address)

        if not latitude or not longitude:
            return jsonify({"error": "Failed to geocode address."}), 400

        coordinates = f"POINT({longitude} {latitude})"


        conn = get_db_connection()
        cursor = conn.cursor()

        # Log the state name for debugging
        logging.info(f"State name received: '{state_name}'")

        # Retrieve the state_id from the state_name
        cursor.execute("SELECT state_id FROM states WHERE state_name = %s", (state_name,))
        state = cursor.fetchone()
        if not state:
            logging.info(f"State name not found: '{state_name}'")
            return jsonify({"error": "State not found."}), 400

        state_id = state[0]

        # Retrieve the city_id from the city_name and state_id
        cursor.execute("SELECT city_id FROM cities WHERE city_name = %s AND state_id = %s", (city_name, state_id))
        city = cursor.fetchone()
        if not city:
            return jsonify({"error": "City not found."}), 400
        city_id = city[0]

        # Check if the postal code exists, if not, add it
        cursor.execute('SELECT postal_code_id FROM postal_codes WHERE postal_code = %s', (postal_code,))
        postal_code_result = cursor.fetchone()
        if not postal_code_result:

            cursor.execute('INSERT INTO postal_codes (postal_code, city_id) VALUES (%s, %s) RETURNING postal_code_id', (postal_code, city_id))
            postal_code = cursor.fetchone()[0]
        else:
            postal_code = postal_code_result[0]


        # Insert the job
        cursor.execute('''
            INSERT INTO jobs (job_id, address, coordinates, duration, tasks, date, start_time, postal_code_id, validated)
            VALUES (uuid_generate_v4(), %s, ST_GeogFromText(%s), %s, %s, %s, %s, %s, %s)
        ''', (address, coordinates, duration, tasks, date, start_time, postal_code, validated))
        conn.commit()
        cursor.close()
        conn.close()

        logging.info(f"Job added successfully for address '{address}' with postal code ID '{postal_code}'.")
        return jsonify({"message": "Job added successfully!"}), 201

    except Exception as e:
        logging.exception("An error occurred while adding the job.")
        return jsonify({"error": str(e)}), 500

@app.route('/jobs/<uuid:job_id>', methods=['PUT'])
def update_job(job_id):
    try:
        updated_job = request.json

        address = updated_job.get('address')
        duration = updated_job.get('duration')
        tasks = updated_job.get('tasks', '')
        date = updated_job.get('date')
        start_time = updated_job.get('start_time')
        postal_code = updated_job.get('postal_code')
        city_name = updated_job.get('city_name')
        state_name = updated_job.get('state_name')
        validated = updated_job.get('validated', False)

        full_address = f"{address}, {city_name}, {state_name}, {postal_code}"
        latitude, longitude = get_coordinates(full_address)

        if not latitude or not longitude:
            return jsonify({"error": "Failed to geocode address."}), 400

        coordinates = f"POINT({longitude} {latitude})"


        conn = get_db_connection()
        cursor = conn.cursor()

        # Retrieve the state_id from the state_name
        cursor.execute("SELECT state_id FROM states WHERE state_name = %s", (state_name,))
        state = cursor.fetchone()
        if not state:
            return jsonify({"error": "State not found."}), 400
        state_id = state[0]

        # Retrieve the city_id from the city_name and state_id
        cursor.execute("SELECT city_id FROM cities WHERE city_name = %s AND state_id = %s", (city_name, state_id))
        city = cursor.fetchone()
        if not city:
            return jsonify({"error": "City not found."}), 400
        city_id = city[0]

        # Update the job with the new data
        cursor.execute('''
            UPDATE jobs
            SET address = %s,
                coordinates = ST_GeogFromText(%s),
                duration = %s,
                tasks = %s,
                date = %s,
                start_time = %s,
                postal_code_id = %s,
                validated = %s,
                city_name = %s,
                state_name = %s
            WHERE job_id = %s
        ''', (address, coordinates, duration, tasks, date, start_time, postal_code, validated, city_name, state_name, job_id))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Job updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/jobs/<uuid:job_id>', methods=['DELETE'])
#def options_job(job_id):
#    return '', 200

def delete_job(job_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        job_id_str = str(job_id)


        # Delete the job from the database
        cursor.execute('DELETE FROM jobs WHERE job_id = %s', (job_id_str,))

        if cursor.rowcount == 0:
            return jsonify({"error": "Job not found."}), 404

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Job deleted successfully!"}), 200

    except Exception as e:
        logging.exception("An error occurred while deleting the job.")
        return jsonify({"error": str(e)}), 500



@app.route('/states', methods=['GET'])
def get_states():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT state_id, state_name, state_abbreviation FROM states')
        states = cursor.fetchall()
        cursor.close()
        conn.close()

        states_list = []
        for state in states:
            states_list.append({
                "state_id": state[0],
                "state_name": state[1],
                "state_abbr": state[2]
            })

        return jsonify(states_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/cities', methods=['GET'])
def get_cities():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT city_id, city_name FROM cities')
        cities = cursor.fetchall()
        cursor.close()
        conn.close()

        cities_list = []
        for city in cities:
            cities_list.append({
                "city_id": city[0],
                "city_name": city[1]
            })

        return jsonify(cities_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

