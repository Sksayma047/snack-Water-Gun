import os
import sys
import subprocess
import time
import signal

def print_banner():
    print("=" * 60)
    print("   SNAKE, WATER, GUN GAME - LAUNCHER")
    print("=" * 60)

def install_backend_deps():
    print("\n--- Installing Backend Dependencies (pip) ---")
    req_file = os.path.join("backend", "requirements.txt")
    if not os.path.exists(req_file):
        print(f"Error: {req_file} not found.")
        return False
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
        print("Backend dependencies installed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing backend dependencies: {e}")
        return False

def install_frontend_deps():
    print("\n--- Checking Frontend Dependencies (npm) ---")
    frontend_dir = "frontend"
    node_modules = os.path.join(frontend_dir, "node_modules")
    
    if not os.path.exists(node_modules):
        print("node_modules not found, running 'npm install'...")
        try:
            # On Windows, shell=True is needed to run command-line tools like npm
            subprocess.check_call(["npm", "install"], cwd=frontend_dir, shell=True)
            print("Frontend dependencies installed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error installing frontend dependencies: {e}")
            return False
    else:
        print("Frontend dependencies (node_modules) already installed.")
    return True

def run_servers():
    processes = []
    
    try:
        # Start Backend Server
        # We run from the 'backend' folder so imports match
        print("\n--- Starting FastAPI Backend Server (Port 8000) ---")
        backend_dir = "backend"
        backend_cmd = [
            sys.executable, 
            "-m", "uvicorn", 
            "main:app", 
            "--host", "127.0.0.1", 
            "--port", "8000"
        ]
        
        backend_process = subprocess.Popen(
            backend_cmd, 
            cwd=backend_dir
        )
        processes.append(backend_process)
        
        # Give backend server 2 seconds to bind port
        time.sleep(2)
        
        # Start Frontend Server
        print("\n--- Starting Vite React Frontend Server (Port 5173) ---")
        frontend_dir = "frontend"
        frontend_cmd = ["npm", "run", "dev"]
        
        frontend_process = subprocess.Popen(
            frontend_cmd, 
            cwd=frontend_dir,
            shell=True
        )
        processes.append(frontend_process)
        
        print("\n" + "=" * 60)
        print("   GAME RUNNING SUCCESSFULLY!")
        print("   Frontend: http://localhost:5173")
        print("   Backend API: http://127.0.0.1:8000")
        print("   Interactive Docs (Swagger): http://127.0.0.1:8000/docs")
        print("   Press Ctrl+C to terminate both servers.")
        print("=" * 60 + "\n")
        
        # Wait and monitor both processes
        while True:
            for p in processes:
                if p.poll() is not None:
                    # One of the processes died
                    print(f"\nProcess {p.pid} terminated with code {p.returncode}")
                    return
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nTerminating servers...")
    finally:
        # Terminate all processes
        for p in processes:
            if p.poll() is None:
                print(f"Stopping process {p.pid}...")
                if sys.platform == 'win32':
                    # Windows termination
                    p.terminate()
                else:
                    p.send_signal(signal.SIGTERM)
        print("All servers stopped successfully.")

def main():
    print_banner()
    
    # 1. Install/Verify backend dependencies
    if not install_backend_deps():
        print("Backend setup failed. Exiting.")
        sys.exit(1)
        
    # 2. Install/Verify frontend dependencies
    if not install_frontend_deps():
        print("Frontend setup failed. Exiting.")
        sys.exit(1)
        
    # 3. Start running both servers
    run_servers()

if __name__ == "__main__":
    main()
