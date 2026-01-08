import React, { useState } from "react";
import Rating from "react-rating";
import { Utils } from "../../utils/utils";

const ReviewCard = ({ trainer, isPublic = false }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const itemsWithRatings = Array.isArray(trainer?.trainer_ratings)
    ? trainer.trainer_ratings.filter(({ ratings }) => ratings?.trainee)
    : [];
  
  const INITIAL_REVIEWS_COUNT = 5;
  const displayedReviews = showAllReviews 
    ? itemsWithRatings 
    : itemsWithRatings.slice(0, INITIAL_REVIEWS_COUNT);
  const hasMoreReviews = itemsWithRatings.length > INITIAL_REVIEWS_COUNT;

  return (
    <div>
      <div className="row d-flex justify-content-start">
        {displayedReviews.map((item, index) => {
          return (
            <React.Fragment key={`trainer_ratings${index}`}>
              <div
                className={`${
                  isPublic ? "col-sm-5  m-2" : "col-sm-6  m-0"
                }`}
              >
                <div className={`card reviews p-3 ${!isPublic && `mb-3`}`}>
                  <h5 className="card-title " style={{ fontSize: "18px" }}>
                    {item?.ratings?.trainee?.title}
                  </h5>
                  <h5 className="mb-1">{item?.trainee_fullname}</h5>
                  <Rating
                    start={0}
                    stop={5}
                    className="mt-2 mb-1"
                    readonly={true}
                    initialRating={item?.ratings?.trainee?.recommendRating}
                    emptySymbol={[
                      "fa fa-star-o fa-2x mediumRating",
                      "fa fa-star-o fa-2x mediumRating",
                      "fa fa-star-o fa-2x mediumRating",
                      "fa fa-star-o fa-2x mediumRating",
                      "fa fa-star-o fa-2x mediumRating",
                      "fa fa-star-o fa-2x mediumRating",
                    ]}
                    fullSymbol={[
                      "fa fa-star fa-2x mediumRating",
                      "fa fa-star fa-2x mediumRating",
                      "fa fa-star fa-2x mediumRating",
                      "fa fa-star fa-2x mediumRating",
                      "fa fa-star fa-2x mediumRating",
                      "fa fa-star fa-2x mediumRating",
                    ]}
                    fractions={2}
                  />
                  <p className="mt-2">{Utils.convertDate(item?.updatedAt)}</p>
                  <p>{item?.ratings?.trainee?.remarksInfo}</p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {hasMoreReviews && (
        <div className="d-flex justify-content-center mt-3 mb-3">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            style={{
              backgroundColor: "#000080",
              color: "#fff",
              border: "1px solid #000080",
              padding: "0.5rem 1.5rem",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0000a0";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#000080";
              e.target.style.transform = "scale(1)";
            }}
          >
            {showAllReviews ? "Show Less" : `View More (${itemsWithRatings.length - INITIAL_REVIEWS_COUNT} more reviews)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
