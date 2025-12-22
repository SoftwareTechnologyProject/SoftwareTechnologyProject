FROM python:3.9-slim

WORKDIR /app

RUN pip install pandas psycopg2-binary requests boto3

COPY main.py .

CMD ["python", "main.py"]