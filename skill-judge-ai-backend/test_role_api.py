import requests
import json

# Test the role analyze endpoint
payload = {
    'resume_id': 'nonexistent',
    'role': 'Senior Software Engineer'
}

try:
    resp = requests.post('http://127.0.0.1:8000/api/role/analyze', json=payload, timeout=5)
    print(f'Status: {resp.status_code}')
    print(f'Response: {resp.text}')
except Exception as e:
    print(f'Error: {e}')
