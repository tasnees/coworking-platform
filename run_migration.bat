@echo off
set MONGODB_URI=mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true^&w=majority
npx prisma migrate dev --name add_membership_plan_model
pause
