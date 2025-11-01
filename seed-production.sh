#!/bin/bash
# Seed Production Database

echo "🌱 Seeding production database..."
echo ""

cd /home/zeb/e-campus/e-campus-backend

MONGODB_URI="mongodb+srv://zebedeealubisia374_db_user:gAeRwmvaCryV8GJN@cluster0.62wlulk.mongodb.net/ecampus?retryWrites=true&w=majority&appName=Cluster0" npm run seed

echo ""
echo "✅ Done! Refresh your frontend to see the data."
