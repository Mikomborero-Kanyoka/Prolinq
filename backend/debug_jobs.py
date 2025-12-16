from database import get_db
from models import Job

# Check job details and status
db = next(get_db())
jobs = db.query(Job).filter(Job.job_embedding.isnot(None)).all()

print('Jobs with embeddings:')
for job in jobs:
    print(f'ID: {job.id}, Title: {job.title}, Status: {job.status}')
    print(f'  Embedding type: {type(job.job_embedding)}')
    if job.job_embedding:
        print(f'  Embedding length: {len(job.job_embedding)}')
    else:
        print('  Embedding length: None')
    print()

db.close()
