#!/bin/bash

echo "🚀 Starting Assist Widget Demo Server..."
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:8080"
echo ""
echo "📖 Open: http://localhost:8080/examples/index.html"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Check if backend .env exists
if [ ! -f packages/backend/.env ]; then
  echo "⚠️  Warning: packages/backend/.env not found"
  echo "   Copy packages/backend/.env.example and add your Azure credentials"
  echo ""
fi

# Start backend in background
cd packages/backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend server in root directory
cd ../.. && npx http-server -p 8080 -c-1 &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
