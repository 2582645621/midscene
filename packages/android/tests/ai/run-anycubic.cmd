@echo off
rem one-click runner for anycubic AI test (sets AI_TEST_TYPE=android)
set AI_TEST_TYPE=android
npx vitest --run anycubic.test.ts
