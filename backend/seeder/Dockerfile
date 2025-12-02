FROM python:3.9-slim

WORKDIR /app

# Cài đặt các thư viện cần thiết
RUN pip install pandas psycopg2-binary requests

# Copy script python vào container
COPY main.py .

# Chạy script
CMD ["python", "main.py"]