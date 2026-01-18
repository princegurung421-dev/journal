import http.server
import socketserver
import json
import os
import sys

# Configuration
PORT = 8000

# Determine paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR) # Assumes server.py is in backend/
DATA_FILE = os.path.join(BACKEND_DIR, 'reflections.json')

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve files from the project root directory
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def do_GET(self):
        # API: Get Reflections
        if self.path.startswith('/api/reflections'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                if os.path.exists(DATA_FILE):
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        self.wfile.write(f.read().encode())
                else:
                    self.wfile.write(b'[]')
            except Exception as e:
                print(f"Error reading reflections: {e}")
                self.wfile.write(b'[]')
            return

        # Serve static files (default behavior)
        return super().do_GET()

    def do_POST(self):
        # API: Save Reflection
        if self.path == '/api/save_reflection':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                new_entry = json.loads(post_data.decode('utf-8'))
                
                # Load existing data
                reflections = []
                if os.path.exists(DATA_FILE):
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        try:
                            reflections = json.load(f)
                        except json.JSONDecodeError:
                            reflections = []
                
                # Add new entry to the top
                reflections.insert(0, new_entry)
                
                # Save back to file
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(reflections, f, indent=4, ensure_ascii=False)
                
                # Success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'message': 'Entry saved'}).encode())
                
            except Exception as e:
                print(f"Error saving reflection: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode())
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode())
            return

        # API: Delete Reflection (Using POST since some environments block DELETE)
        if self.path == '/api/delete_reflection':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                entry_id = request_data.get('id')
                
                if not entry_id:
                    raise Exception("No ID provided")

                # Load existing data
                reflections = []
                if os.path.exists(DATA_FILE):
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        try:
                            reflections = json.load(f)
                        except json.JSONDecodeError:
                            reflections = []
                
                # Filter out the entry to delete
                initial_count = len(reflections)
                reflections = [r for r in reflections if str(r.get('id')) != str(entry_id)]
                
                if len(reflections) == initial_count:
                    raise Exception("Entry not found")

                # Save back to file
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(reflections, f, indent=4, ensure_ascii=False)
                
                # Success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'message': 'Entry deleted'}).encode())

            except Exception as e:
                print(f"Error deleting reflection: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode())
            return
            
    # Handle CORS preflight options
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    print(f"Starting API Server on port {PORT}...")
    print(f"Serving static files from: {PROJECT_ROOT}")
    print(f"Data file: {DATA_FILE}")
    print(f"Open http://localhost:{PORT} in your browser.")
    
    # Allow address reuse to avoid "Address already in use" errors on restart
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)
