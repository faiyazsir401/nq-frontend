import React from "react";
import Rating from "react-rating";
import { Utils } from "../../utils/utils";

const ReviewCard = ({ trainer, isPublic = false }) => {
  const itemsWithRatings = Array.isArray(trainer?.trainer_ratings)
    ? trainer.trainer_ratings.filter(({ ratings }) => ratings?.trainee)
    : [];
  return (
    <div className="row d-flex justify-content-start">
      {itemsWithRatings.map((item, index) => {
        return (
          <React.Fragment>
            <div
              key={`trainer_ratings${index}`}
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
  );
};

export default ReviewCard;
