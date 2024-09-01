echo Starting server...

start /b "Python server" cmd /c ".\bats\Python.bat"
start /b "Frontend server" cmd /c ".\bats\Node.bat"