@echo off
echo Running pnpm build...
pnpm build

echo Running pnpm inject (auto-confirm with Enter)...
echo. | pnpm inject

echo Done!
pause
