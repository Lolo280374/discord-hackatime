@echo off
echo Running pnpm build...
pnpm build

echo Running pnpm inject
pnpm inject

echo Done!
pause
