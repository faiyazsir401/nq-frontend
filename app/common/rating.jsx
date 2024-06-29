import Rating from "react-rating";

const ColoredRating = ({ onChange, key, initialRating }) => {
  return (
    <Rating
      key={key}
      initialRating={initialRating}
      start={0}
      
      stop={5}
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
      onChange={(value) => {
        onChange(value)
      }}
    />
  );
};
export default ColoredRating;
