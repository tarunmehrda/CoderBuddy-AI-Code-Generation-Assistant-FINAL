from AGENT.tools import write_file, read_file, list_files, get_current_directory

# Test the tools
print("Current directory:", get_current_directory())

# Write a test file
result = write_file("test.txt", "This is a test file.")
print("Write result:", result)

# List files
files = list_files()
print("Files:", files)

# Read the test file
content = read_file("test.txt")
print("File content:", content)