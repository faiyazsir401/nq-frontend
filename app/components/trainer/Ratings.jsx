import React from 'react'
import { Utils } from '../../../utils/utils';
import { Star } from "react-feather";
const Ratings = ({ratings, extraClasses = ""}) => {
    const { ratingRatio, totalRating } = Utils.getRatings(ratings);
  return (
    <div>
      <div className={extraClasses}>
        <Star color="#FFC436" size={28} className="star-container star-svg" />
        <p className="ml-1 mt-1 mr-1 font-weight-light">{ratingRatio || 0}</p>
        <p className="mt-1">({totalRating || 0})</p>
      </div>
    </div>
  )
}

export default Ratings