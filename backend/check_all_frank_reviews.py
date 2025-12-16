import sys
sys.path.append('.')
from database import get_db
from models import User, Review, Job

def check_all_frank_reviews():
    print("🔍 Checking ALL Reviews for Frank Kamambo")
    
    db = next(get_db())
    
    # Find Frank Kamambo
    frank = db.query(User).filter(
        (User.full_name == 'Frank Kamambo') | 
        (User.username.ilike('%frank%'))
    ).first()

    if not frank:
        print("❌ Frank Kamambo not found")
        return

    print(f"✅ Found Frank Kamambo: ID={frank.id}, Username={frank.username}")
    
    # Get ALL reviews for Frank (both as reviewed user and as reviewer)
    reviews_as_reviewed = db.query(Review).filter(Review.reviewed_user_id == frank.id).all()
    reviews_as_reviewer = db.query(Review).filter(Review.reviewer_id == frank.id).all()
    
    print(f"\n📝 Reviews where Frank is REVIEWED USER: {len(reviews_as_reviewed)}")
    for i, review in enumerate(reviews_as_reviewed, 1):
        job = db.query(Job).filter(Job.id == review.job_id).first()
        reviewer = db.query(User).filter(User.id == review.reviewer_id).first()
        
        print(f"\n  📋 Review {i}:")
        print(f"     - Review ID: {review.id}")
        print(f"     - Rating: {review.rating} stars")
        print(f"     - Comment: {review.comment}")
        print(f"     - Job ID: {review.job_id}")
        print(f"     - Job Title: {job.title if job else 'Unknown'}")
        print(f"     - Reviewer ID: {review.reviewer_id}")
        print(f"     - Reviewer Name: {reviewer.full_name if reviewer else 'Unknown'}")
        print(f"     - Created: {review.created_at}")
    
    print(f"\n📝 Reviews where Frank is REVIEWER: {len(reviews_as_reviewer)}")
    for i, review in enumerate(reviews_as_reviewer, 1):
        job = db.query(Job).filter(Job.id == review.job_id).first()
        reviewed_user = db.query(User).filter(User.id == review.reviewed_user_id).first()
        
        print(f"\n  📋 Review {i}:")
        print(f"     - Review ID: {review.id}")
        print(f"     - Rating: {review.rating} stars")
        print(f"     - Comment: {review.comment}")
        print(f"     - Job ID: {review.job_id}")
        print(f"     - Job Title: {job.title if job else 'Unknown'}")
        print(f"     - Reviewed User ID: {review.reviewed_user_id}")
        print(f"     - Reviewed User Name: {reviewed_user.full_name if reviewed_user else 'Unknown'}")
        print(f"     - Created: {review.created_at}")
    
    # Check for any orphaned reviews or reviews with missing data
    print(f"\n🔍 Checking for ALL reviews in database:")
    all_reviews = db.query(Review).all()
    print(f"Total reviews in database: {len(all_reviews)}")
    
    for review in all_reviews:
        if review.reviewed_user_id == frank.id or review.reviewer_id == frank.id:
            print(f"  - Review ID {review.id}: rating={review.rating}, job_id={review.job_id}")
    
    # Calculate average rating
    if reviews_as_reviewed:
        avg_rating = sum(r.rating for r in reviews_as_reviewed) / len(reviews_as_reviewed)
        print(f"\n⭐ Frank's Average Rating (as reviewed user): {avg_rating:.1f} stars")
    else:
        print(f"\n⭐ Frank has no reviews as a reviewed user")

if __name__ == "__main__":
    check_all_frank_reviews()
