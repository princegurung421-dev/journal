"""
WSGI entry point for deployment (PythonAnywhere / Gunicorn / etc.).

On PythonAnywhere, edit your web app's WSGI configuration file so it contains
the two lines below (adjust the project path to match your username), or point
it at this file directly:

    import sys
    path = '/home/YOUR_USERNAME/journal'
    if path not in sys.path:
        sys.path.insert(0, path)
    from app import app as application

The variable MUST be named `application` for the WSGI server to find it.
"""

from app import app as application

if __name__ == "__main__":
    application.run()
