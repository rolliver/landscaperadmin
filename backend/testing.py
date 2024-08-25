import unittest
from app import app, get_db_connection
from unittest.mock import patch, MagicMock

class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True 

    @patch('app.get_db_connection')
    def test_get_customers(self, mock_db_conn):
        # Mock the database connection and cursor
        mock_cursor = MagicMock()
        mock_db_conn.return_value.cursor.return_value = mock_cursor

        # Mock the fetchall method to return some test data
        mock_cursor.fetchall.return_value = [
            (1, 'John', 'Doe', 'john@example.com', '1234567890', '123 Main St', 'New York', 'NY', '10001')
        ]

        response = self.app.get('/customers')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['first_name'], 'John')

    @patch('app.get_db_connection')
    def test_add_customer(self, mock_db_conn):
        # Mock the database connection and cursor
        mock_cursor = MagicMock()
        mock_db_conn.return_value.cursor.return_value = mock_cursor

        # Mock the fetchone method to return a new customer ID
        mock_cursor.fetchone.return_value = [1]

        test_customer = {
            'first_name': 'Jane',
            'last_name': 'Doe',
            'email': 'jane@example.com',
            'phone_number': '0987654321',
            'address': '456 Elm St',
            'city_id': 1,
            'state_id': 1,
            'postal_code_id': 1
        }

        response = self.app.post('/customers', json=test_customer)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['customer_id'], 1)

    @patch('app.get_db_connection')
    def test_get_jobs(self, mock_db_conn):
        # Mock the database connection and cursor
        mock_cursor = MagicMock()
        mock_db_conn.return_value.cursor.return_value = mock_cursor

        # Mock the fetchall method to return some test data
        mock_cursor.fetchall.return_value = [
            ('123e4567-e89b-12d3-a456-426614174000', '789 Oak St', 40.7128, -74.0060, 
             '2 hours', 'Clean,Mop', '2023-06-01', '09:00:00', True, '10002', 'New York', 'NY')
        ]

        response = self.app.get('/jobs')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['address'], '789 Oak St')

    @patch('app.get_db_connection')
    @patch('app.get_coordinates')
    def test_add_job(self, mock_get_coordinates, mock_db_conn):
        # Mock the database connection and cursor
        mock_cursor = MagicMock()
        mock_db_conn.return_value.cursor.return_value = mock_cursor

        # Mock the get_coordinates function
        mock_get_coordinates.return_value = (40.7128, -74.0060)

        # Mock the fetchone method to return existing state and city IDs
        mock_cursor.fetchone.side_effect = [(1,), (1,), (1,)]

        test_job = {
            'address': '789 Oak St',
            'duration': '2 hours',
            'tasks': ['Clean', 'Mop'],
            'date': '2023-06-01',
            'start_time': '09:00:00',
            'postal_code': '10002',
            'city_name': 'New York',
            'state_name': 'NY',
            'validated': True
        }

        response = self.app.post('/jobs', json=test_job)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['message'], 'Job added successfully!')

if __name__ == '__main__':
    unittest.main()

